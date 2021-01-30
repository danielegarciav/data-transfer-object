# data-transfer-object

Data Transfer Object class built on [TypeStacks's `class-validator`](https://github.com/typestack/class-validator). Allows you to build a class that validates input from outside sources and ensures its shape is correct. Full TypeScript support with strict, strong typing.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of contents**

- [Installation](#installation)
  - [For Node.js and bundlers (Webpack, Rollup, etc)](#for-nodejs-and-bundlers-webpack-rollup-etc)
  - [For browsers (script tag)](#for-browsers-script-tag)
- [Release notes](#release-notes)
- [Usage](#usage)
  - [Throwing a custom error on validation failure](#throwing-a-custom-error-on-validation-failure)
    - [Accessing raw error data in custom error handler](#accessing-raw-error-data-in-custom-error-handler)
  - [Get validation errors without throwing an error](#get-validation-errors-without-throwing-an-error)
  - [Run async validators](#run-async-validators)
- [Full API Documentation](#full-api-documentation)
- [Comprehensive example](#comprehensive-example)
- [Development and contributions](#development-and-contributions)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

### For Node.js and bundlers (Webpack, Rollup, etc)

```bash
npm i data-transfer-object
# or
yarn add data-transfer-object
```

### For browsers (script tag)

Browser builds aren't available yet, but they are planned for the future.

## Release notes

See information about breaking changes and release notes [here](changelog.md).

## Usage

Create your own classes by importing and extending `DataTransferObject` with your own properties, and using the appropriate validator decorators. This package re-exports all decorators and functions from [TypeStack's `class-validator`](https://github.com/typestack/class-validator).

```typescript
import { DataTransferObject, IsString } from 'data-transfer-object';

class MyDto extends DataTransferObject {
  // Insert decorated properties here
  @IsString()
  myString: string;
}
```

**TypeScript note:** when using TypeScript with `"strict": true`, you must use non-null assertions (`!:`) when declaring class properties. Also, `experimentalDecorators` and `emitDecoratorMetadata` must be set to `true` in your `tsconfig.json`.

Once your class is defined, you can construct a new instance of it, pass your input into it, and run `.validate()` on it. If your input is valid, it will return a plain object with the validated data. Otherwise, by default, a `ValidationException` will be thrown.

```typescript

try {
  const validated = new MyDto(input).validate();
  console.log(validated);
  // validated === input
} catch (err) {
  if (err instanceof ValidationException) {
    console.error(err.validationErrors);
    // e.g. if `input` was `{ myString: 1234 }`, this would output:
    { "myString": ["property myString should be a string"] }
  }
}
```

### Throwing a custom error on validation failure

You can use `setValidationErrorHandler()` to register a callback to run whenever a `.validate()` call fails on any object across your project. For instance:

```typescript
import { setValidationErrorHandler, ValidationErrorMap } from 'data-transfer-object';

class CustomError extends Error {
  statusCode = 400;
  errors: ValidationErrorMap;

  constructor(errors: ValidationErrorMap) {
    super('Failed to validate');
    this.errors = errors;
  }
}

setValidationErrorHandler(errors => {
  throw new CustomError(errors);
});

try {
  new MyExampleDto({ invalidData: 42 }).validate();
} catch (err) {
  if (err instanceof CustomError) {
    console.error(`Request failed with error code ${err.statusCode}`);
    console.error(err.errors);
  }
}
```

#### Accessing raw error data in custom error handler

Under the hood, `data-transfer-object` formats the raw array of `ValidationError` returned by `class-validator` into an object mapping keys to properties and values to validation messages (aka a `ValidationErrorMap`).

If you wish to get direct access to the array of `ValidationError` in your error handler, you may pass in `{ rawErrors: true }` as a second parameter to `.setValidationErrorHandler()`:

```typescript
import { setValidationErrorHandler } from 'data-transfer-object';

setValidationErrorHandler(
  errors => {
    // `errors` here is now of type `ValidationError[]`.
    console.error(errors);
    // example output:
    [
      {
        target: { myString: 12 },
        value: 12,
        property: 'myString',
        children: [],
        constraints: { isString: 'myString must be a string' },
      },
    ];
  },
  { rawErrors: true },
);
```

### Get validation errors without throwing an error

You may use `.getValidationErrors()` to get an array of `ValidationError` without having to thrown an actual error. To get the plain data later, use `.toJSON()`.

```typescript
const dto = new MyDto({ someData: 'data' });
const errors = dto.getValidationErrors();
if (errors.length) {
  console.error(errors);
  return;
}
const data = dto.toJSON();
```

Take a look at [`class-validator`'s documentation](https://github.com/typestack/class-validator/) to get information on all available validators and validation options.

### Run async validators

`.validate()` and `.getValidationErrors()` will only run synchronous validators, which covers most use cases in a web application. If you would like to run asynchronous validators as well, use `.validateAsync()` and `.getValidationErrorsAsync()` respectively. These counterparts will always return a promise, even if there are no async validators on the validated object.

## Full API Documentation

The most up-to-date documentation for all exported items from this package is automatically generated from code and available at https://danielegarciav.github.io/data-transfer-object/.

You may wish to uncheck the "Externals" checkbox option (top-right on desktop, cog icon on mobile) in order to hide documentation from `class-validator` and focus only on what this package exports.

## Comprehensive example

In the following example, we have an Express application that lets us sign up users.

- We define an `UserSignupInput` data transfer object class.
- We define our own custom errors `ApiError` and `ApiValidationError`, which allow us to define a status code, among other things.
- We define an [Express error handler](https://expressjs.com/en/guide/error-handling.html) to catch any errors and format the result that will be sent back to our client.
- We wire everything up as an Express app, and make it so validation errors throw an `ApiValidationError`, which will be then appropriately handled by our Express error handler.
- We can then write our signup controller.

```typescript
// input-classes.ts

import { DataTransferObject, IsString, Length, MinLength } from 'data-transfer-object';

export class UserSignupInput extends DataTransferObject {
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
```

```typescript
// custom-errors.ts

import { ValidationErrorMap } from 'data-transfer-object';

export class ApiError extends Error {
  type: string;
  statusCode: number;

  constructor(type: ApiErrorType, statusCode?: number, message?: string) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.message = message ?? 'Unspecified error';
    this.statusCode = statusCode ?? 500;
  }
}

export class ApiValidationError extends ApiError {
  validationMessages: ValidationErrorMap;
  constructor(errors: ValidationErrorMap) {
    super('InvalidRequest', 400, 'Request is invalid');
    this.validationMessages = errors;
  }
}
```

```typescript
// error-handler.ts

import { Request, Response, NextFunction } from 'express';
import { ApiError } from './custom-errors';

export function expressErrorHandler(
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const jsonResponse = { error: { ...error, statusCode } };

  // Log non-ApiErrors to console
  if (!(error instanceof ApiError)) console.error(error);

  res.status(statusCode).json(jsonResponse);
}
```

```typescript
// express-server.ts

import Express from 'express';
import { setValidationErrorHandler } from 'data-transfer-object';
import { expressErrorHandler } from './error-handler.ts';
import { ApiValidationError } from './custom-errors.ts';
import { signup } from './signup-controller.ts';

setValidationErrorHandler(errors => {
  throw new ApiValidationError(errors);
});

export const app = Express();
app.use(Express.json());
app.use('/users/signup', signup);
app.use(expressErrorHandler);
```

```typescript
// signup-controller.ts

import { Request, Response, NextFunction } from 'express';
import { User } from './models';
import { UserSignupInput } from './input-classes';

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = new UserSignupInput(req.body).validate();
    await User.register(username, password);
    return res.status(200).json({ success: true });
  } catch (err) {
    return next(err);
  }
}
```

We may also use something like [`express-async-errors`](https://github.com/davidbanham/express-async-errors) in order to avoid having to wrap our async code in try/catch statements and manually calling `next()`. This is something that will be automatically addressed by Express 5 once it is released.

## Development and contributions

Check package.json to find scripts related to installing dependencies, building, testing, linting and generating documentation. I am open to new issues and pull requests!

## License

MIT
