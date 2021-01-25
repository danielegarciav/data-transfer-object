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

/**
 * Creates a new data transfer object which will validate and reshape its input
 * data based on the validators of its own properties. Must be extended, should
 * not be instantiated on its own.
 */
export abstract class DataTransferObject {
  /** Cached validation errors from previous validation. */
  private _validationErrors: ValidationError[] = [];
  /** Whether this object has already been validated. */
  private _validated = false;
  /** Pending validation promise, if any. */
  private _ongoingValidation?: Promise<ValidationError[]>;

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
    if (this._validated) return this._validationErrors;
    this._validationErrors = validateSync(this, { ...defaultOpts, ...opts });
    this._validated = true;
    return this._validationErrors;
  }

  /**
   * Runs all synchronous and asynchronous validators on this object.
   * Always returns a promise. To validate synchronously, use `.validate()`.
   * @param opts Options to pass to the validator system.
   */
  async validateAsync(opts?: ValidatorOptions): Promise<ValidationError[]> {
    if (this._validated) return this._validationErrors;
    if (this._ongoingValidation) return this._ongoingValidation;
    this._ongoingValidation = validate(this, { ...defaultOpts, ...opts }).then(errs => {
      this._validationErrors = errs;
      this._validated = true;
      this._ongoingValidation = undefined;
      return errs;
    });
    return this._ongoingValidation;
  }

  /**
   * Returns a JSON friendly object containing only data properties of this object (ie, no validation functions).
   * Automatically used by `JSON.stringify()`.
   */
  toJSON(): Data<this> {
    return Object.fromEntries(
      Object.entries(this).filter(([key, val]) => !key.startsWith('_') && typeof val !== 'function'),
    ) as Data<this>;
  }
}
