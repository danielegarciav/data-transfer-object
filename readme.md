# data-transfer-object

Data Transfer Object class built on [TypeStacks's `class-validator`](https://github.com/typestack/class-validator). Allows you to build a DTO class that automatically validates input from outside sources and ensures its shape is correct.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of contents**

- [Installation](#installation)
  - [For Node.js and bundlers (Webpack, Rollup, etc)](#for-nodejs-and-bundlers-webpack-rollup-etc)
  - [For browsers (script tag)](#for-browsers-script-tag)
- [Usage](#usage)
- [Documentation](#documentation)
- [Example](#example)
- [Development](#development)
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

UMD builds aren't available yet. Rollup builds are planned for the future.

## Usage

Create a DTO class by importing `DataTransferObject`, extending it with your custom properties, and using the appropriate decorators. This package re-exports all decorators and functions from [TypeStack's `class-validator`](https://github.com/typestack/class-validator).

```typescript
import { DataTransferObject } from 'data-transfer-object';

class MyDto extends DataTransferObject {
  // Insert decorated properties here
}
```

Note that when using TypeScript with `"strict": true`, you must use non-null assertions (`!:`) when declaring class properties. Also, `experimentalDecorators` and `emitDecoratorMetadata` must be set to `true` in your `tsconfig.json`.

## Documentation

The most up-to-date documentation is automatically generated from code and available at https://danielegarciav.github.io/data-transfer-object/.

## Example

In the following example, we have an Express application that lets us sign up users. In order to validate input from the web app client, we create a data transfer object representing the input data, and attach our desired validators:

```typescript
// input-dtos.ts

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

The Express request handler in our example:

```typescript
// signup-controller.ts

import { Request, Response } from 'express';
import { User } from './models';
import { UserSignupInput } from './input-dtos';

export async function signup(req: Request, res: Response): {
  // Construct a new DTO instance passing starting state as argument.
  const input = new UserSignupInput(req.body);

  // Run validation. Only synchronous validators are run by default, which covers most use cases.
  const errors = input.validate();

  // You may also use `.validateAsync()` to run both sync + async validators.
  const asyncErrors = await input.validateAsync();

  // Result will be an array of `ValidationError[]`
  if (errors.length) {
    // Handle validation errors here, for example:
    return res.status(400).json(errors);
  }

  // Your input is guaranteed to be validated at this point.
  await User.register(input);

  // Use `.toJSON()` to get a plain object with just your data.
  // `.toJSON()` is automatically called when a DTO instance is stringified.
  const data = input.toJSON();
  typeof input.validate === 'function';
  typeof data.validate === 'undefined';

  return res.status(200).json({ success: true });
}
```

## Development

Check package.json to find scripts related to installing dependencies, building, testing, linting and generating documentation.

## License

MIT
