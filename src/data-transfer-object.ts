import { validate, validateSync, ValidationError, ValidatorOptions } from 'class-validator';
export * from 'class-validator';

/** Extract the data properties out of a Data Transfer Object. */
export type Data<T extends DataTransferObject> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]: T[K] extends Function ? never : T[K];
};

const defaultOpts: ValidatorOptions = {
  whitelist: true,
};

// Must use symbols for private properties so that they are not included in validation

/** Cached validation errors from previous validation. */
const validationErrors = Symbol.for('validationErrors');
/** Whether this object has already been validated. */
const validated = Symbol.for('validated');
/** Pending validation promise, if any. */
const ongoingValidation = Symbol.for('ongoingValidation');

/**
 * Creates a new data transfer object which will validate and reshape its input
 * data based on the validators of its own properties. Must be extended, should
 * not be instantiated on its own.
 */
export abstract class DataTransferObject {
  /** Cached validation errors from previous validation. */
  private [validationErrors]: ValidationError[] = [];
  /** Whether this object has already been validated. */
  private [validated] = false;
  /** Pending validation promise, if any. */
  private [ongoingValidation]?: Promise<ValidationError[]>;

  /**
   * Constructs a new instance of a data transfer object with the given input.
   * @param data The input data to assign to this data transfer object.
   */
  constructor(data: unknown) {
    Object.assign(this, data);
  }

  /**
   * Runs all synchronous validators on this object.
   * To run asynchronous validators as well, use `.validateAsync()`.
   * @param opts Options to pass to the validator system.
   */
  validate(opts?: ValidatorOptions): ValidationError[] {
    if (this[validated]) return this[validationErrors];
    this[validationErrors] = validateSync(this, { ...defaultOpts, ...opts });
    this[validated] = true;
    return this[validationErrors];
  }

  /**
   * Runs all synchronous and asynchronous validators on this object.
   * Always returns a promise. To validate synchronously, use `.validate()`.
   * @param opts Options to pass to the validator system.
   */
  async validateAsync(opts?: ValidatorOptions): Promise<ValidationError[]> {
    if (this[validated]) return this[validationErrors];

    const ongoing = this[ongoingValidation];
    if (ongoing) return ongoing;

    const newPromise = validate(this, { ...defaultOpts, ...opts }).then(errs => {
      this[validationErrors] = errs;
      this[validated] = true;
      this[ongoingValidation] = undefined;
      return errs;
    });

    this[ongoingValidation] = newPromise;
    return newPromise;
  }

  /**
   * Returns a JSON friendly object containing only data properties of this object (ie, no validation functions).
   * Automatically used by `JSON.stringify()`.
   */
  toJSON(): Data<this> {
    return Object.fromEntries(
      Object.entries(this).filter(([_key, val]) => typeof val !== 'function'),
    ) as Data<this>;
  }
}
