import type { ValidationError } from 'class-validator';
import { getValidationErrorMap, ValidationErrorMap } from '../validation-error-map';

const emptyInput: ValidationError[] = [];
const emptyOutput: ValidationErrorMap = {};

const testInput1: ValidationError[] = [
  {
    target: {},
    value: undefined,
    property: 'email',
    children: [],
    constraints: {
      isEmail: 'email must be an email',
    },
  },
  {
    target: {},
    value: undefined,
    property: 'displayName',
    children: [],
    constraints: {
      isLength: 'displayName must be longer than or equal to 1 characters',
      isString: 'displayName must be a string',
    },
  },
  {
    target: {},
    value: undefined,
    property: 'username',
    children: [],
    constraints: {
      isLength: 'username must be 2-36 characters long',
      isString: 'username must be a string',
    },
  },
  {
    target: {},
    value: undefined,
    property: 'password',
    children: [],
    constraints: {
      minLength: 'password must be at least 8 characters long',
      isString: 'password must be a string',
    },
  },
  // test no constraints case
  {
    property: 'noConstraintsTest',
  },
];

const expectedOutput1: ValidationErrorMap = {
  email: ['email must be an email'],
  displayName: ['displayName must be longer than or equal to 1 characters', 'displayName must be a string'],
  username: ['username must be 2-36 characters long', 'username must be a string'],
  password: ['password must be at least 8 characters long', 'password must be a string'],
  noConstraintsTest: [],
};

describe('validation-error-map', () => {
  it('returns the expected error map on empty input', () => {
    expect(getValidationErrorMap(emptyInput)).toEqual(emptyOutput);
  });

  it('returns the expected error map on test input', () => {
    const output = getValidationErrorMap(testInput1);
    expect(output).toEqual(expectedOutput1);
  });
});
