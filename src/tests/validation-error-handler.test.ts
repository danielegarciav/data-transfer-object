import {
  onValidationError,
  setValidationErrorHandler,
  clearValidationErrorHandler,
} from '../validation-error-handler';

beforeEach(() => {
  jest.clearAllMocks();
  clearValidationErrorHandler();
});

class TestError extends Error {}

const testCallback = jest.fn((_errs: unknown) => {
  throw new TestError();
});

describe('validation-error-handler', () => {
  it('clears `onValidaitonError` when requested', () => {
    expect(onValidationError).toBeUndefined();
    setValidationErrorHandler(testCallback, { rawErrors: true });
    expect(onValidationError).toBe(testCallback);

    clearValidationErrorHandler();
    expect(onValidationError).toBeUndefined();
  });

  it('sets `onValidationError` directly when `rawErrors == true`', () => {
    setValidationErrorHandler(testCallback, { rawErrors: true });

    expect(onValidationError).toBe(testCallback);
    expect(() => onValidationError?.([])).toThrowError(TestError);
    expect(testCallback).toHaveBeenCalledWith([]);
  });

  it('sets `onValidationError` with the expected callback when `rawErrors == false`', () => {
    setValidationErrorHandler(testCallback);

    expect(onValidationError).toBeFunction();
    expect(onValidationError).not.toBe(testCallback);
    expect(() => onValidationError?.([])).toThrowError(TestError);
    expect(testCallback).toHaveBeenCalledWith({});
  });
});
