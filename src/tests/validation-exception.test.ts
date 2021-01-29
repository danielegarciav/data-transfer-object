import { ValidationException } from '../validation-exception';
import * as mockVem from '../validation-error-map';
import { mocked } from 'ts-jest/utils';
import type { ValidationError } from 'class-validator';

jest.mock('../validation-error-map');

const testValidationErrorMap: mockVem.ValidationErrorMap = { testKey: ['testValue'] };
mocked(mockVem.getValidationErrorMap).mockImplementation(() => testValidationErrorMap);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('validation-exception', () => {
  it('extends Error', () => {
    const validationException = new ValidationException([]);
    expect(validationException).toBeInstanceOf(Error);
  });

  it('turns incoming array into a map', () => {
    const input: ValidationError[] = [];
    const validationException = new ValidationException(input);
    expect(mockVem.getValidationErrorMap).toHaveBeenCalledTimes(1);
    expect(validationException.validationErrorMap).toEqual(testValidationErrorMap);
  });

  it('directly sets incoming error map to the new instance', () => {
    const input: mockVem.ValidationErrorMap = {};
    const validationException = new ValidationException(input);
    expect(mockVem.getValidationErrorMap).toHaveBeenCalledTimes(0);
    expect(validationException.validationErrorMap).toEqual(input);
  });
});
