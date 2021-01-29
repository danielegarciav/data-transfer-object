import { ValidationError } from 'class-validator';
import { getValidationErrorMap, ValidationErrorMap } from './validation-error-map';

export type ValidationErrorHandler = (errors: ValidationError[]) => never;
export type ValidationErrorMapHandler = (errorMap: ValidationErrorMap) => never;

export interface ValidationErrorHandlerOptions {
  /**
   * By default, errors will be returned as a map. Setting this to `true` will pass in an
   * array of `ValidationError` to the callback instead.
   * @default false
   */
  rawErrors?: boolean;
}

/**
 * The currently set custom validation error handler, if any.
 * To set this, use `.setValidationErrorHandler()`.
 */
export let onValidationError: ValidationErrorHandler | undefined;

/**
 * Register a callback to run whenever a validation fails. The callback must throw.
 * @param handler The callback that will receive a map of validation errors. Must throw.
 * @param opts Options
 */
export function setValidationErrorHandler(
  handler: ValidationErrorMapHandler,
  opts?: ValidationErrorHandlerOptions & { rawErrors?: false },
): void;

/**
 * Register a callback to run whenever a validation fails. The callback must throw.
 * @param handler The callback that will receive an array of validation errors. Must throw.
 * @param opts Options
 */
export function setValidationErrorHandler(
  handler: ValidationErrorHandler,
  opts: ValidationErrorHandlerOptions & { rawErrors: true },
): void;

/**
 * Register a callback to run whenever a validation fails. The callback must throw.
 * @param handler The callback that will receive either an array or a map of validation errors,
 * depending on options. Must throw.
 * @param opts Options
 */
export function setValidationErrorHandler(
  handler: ValidationErrorHandler | ValidationErrorMapHandler,
  opts?: ValidationErrorHandlerOptions,
): void {
  if (opts?.rawErrors) {
    onValidationError = handler as ValidationErrorHandler;
    return;
  }
  onValidationError = errors => {
    const errorMap = getValidationErrorMap(errors);
    return (handler as ValidationErrorMapHandler)(errorMap);
  };
}

/**
 * Unregisters the callback to run when a validation fails, and uses the default behavior.
 */
export function clearValidationErrorHandler(): void {
  onValidationError = undefined;
}
