import { mocked } from 'ts-jest';
import { DataTransferObject } from '../data-transfer-object';
import * as CVMock from 'class-validator';

jest.mock('class-validator');
const { validateSync, validate, IsString, MinLength, Length } = jest.requireActual<
  typeof import('class-validator')
>('class-validator');

mocked(CVMock.validate).mockImplementation((...args) => validate(...args));
mocked(CVMock.validateSync).mockImplementation((...args) => validateSync(...args));

class UserSignupInput extends DataTransferObject {
  @IsString()
  @Length(2, 36, {
    message: 'username must be 2-36 characters long',
  })
  username!: string;

  @IsString()
  @MinLength(8, {
    message: 'password must be at least 8 characters long',
  })
  password!: string;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('data-transfer-object', () => {
  it('detects validation errors (sync)', () => {
    const userSignupInput = new UserSignupInput({ username: '', password: '' });
    const errors = userSignupInput.getValidationErrors();
    expect(CVMock.validateSync).toHaveBeenCalledTimes(1);
    expect(errors).toBeArrayOfSize(2);
  });

  it('detects validation errors (async)', async () => {
    const userSignupInput = new UserSignupInput({ username: '', password: '' });
    const errors = await userSignupInput.getValidationErrorsAsync();
    expect(CVMock.validate).toHaveBeenCalledTimes(1);
    expect(errors).toBeArrayOfSize(2);
  });

  it('is instance of DataTransferObject', () => {
    const userSignupInput = new UserSignupInput({ username: '', password: '' });
    expect(userSignupInput).toBeInstanceOf(DataTransferObject);
  });
  it('silently gets rid of extra fields by default', () => {
    const inputData = { username: 'username', password: 'password', extra: 1 };
    const userSignupInput = new UserSignupInput(inputData);
    const errors = userSignupInput.getValidationErrors();
    expect(errors).toBeArrayOfSize(0);
    expect(userSignupInput).not.toContainKey('extra');
  });
  it('detects missing fields', () => {
    const inputData = { username: 'username' };
    const userSignupInput = new UserSignupInput(inputData);
    const errors = userSignupInput.getValidationErrors();
    expect(errors).toBeArrayOfSize(1);
  });
  it('returns public data only', () => {
    const inputData = { username: 'username', password: 'password' };
    const expectedData = { username: 'username', password: 'password' };
    const userSignupInput = new UserSignupInput(inputData);
    userSignupInput.getValidationErrors();
    const publicData = userSignupInput.toJSON();

    // Test equality - both objects should be subsets of each other
    expect(publicData).toMatchObject(expectedData);
    expect(expectedData).toMatchObject(publicData);

    expect(userSignupInput).toBeInstanceOf(DataTransferObject);
    expect(publicData).not.toBeInstanceOf(DataTransferObject);
  });

  it('only validates once (sync)', () => {
    const inputData = { username: 'username' };
    const userSignupInput = new UserSignupInput(inputData);
    userSignupInput.getValidationErrors();
    userSignupInput.getValidationErrors();
    userSignupInput.getValidationErrors();
    expect(CVMock.validateSync).toBeCalledTimes(1);
  });

  it('only validates once (async series)', async () => {
    const inputData = { username: 'username' };
    const userSignupInput = new UserSignupInput(inputData);
    await userSignupInput.getValidationErrorsAsync();
    await userSignupInput.getValidationErrorsAsync();
    await userSignupInput.getValidationErrorsAsync();
    expect(CVMock.validate).toBeCalledTimes(1);
  });

  it('only validates once (async parallel)', async () => {
    const inputData = { username: 'username' };
    const userSignupInput = new UserSignupInput(inputData);
    await Promise.all([
      userSignupInput.getValidationErrorsAsync(),
      userSignupInput.getValidationErrorsAsync(),
      userSignupInput.getValidationErrorsAsync(),
    ]);
    expect(CVMock.validate).toBeCalledTimes(1);
  });

  it('detects proper errors on unknown properties when requested', () => {
    {
      const inputData = { username: 'username', password: 'password', extra: 1 };
      const input = new UserSignupInput(inputData);
      const errorsNonWhitelisted = input.getValidationErrors({ forbidNonWhitelisted: true });
      expect(errorsNonWhitelisted).toBeArrayOfSize(1);
      const errorsUnknownValues = input.getValidationErrors({ forbidUnknownValues: true });
      expect(errorsUnknownValues).toBeArrayOfSize(1);
    }
    {
      const inputData = { username: 'username', password: 'password' };
      const input = new UserSignupInput(inputData);
      const errorsNonWhitelisted = input.getValidationErrors({ forbidNonWhitelisted: true });
      expect(errorsNonWhitelisted).toBeArrayOfSize(0);
      const errorsUnknownValues = input.getValidationErrors({ forbidUnknownValues: true });
      expect(errorsUnknownValues).toBeArrayOfSize(0);
    }
  });
});
