# data-transfer-object

Data Transfer Object class built on `class-validator`. Allows you to build a DTO class that automatically validates input from outside sources and ensures its shape is correct.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of contents**

- [data-transfer-object](#data-transfer-object)
- [Installation](#installation)
  - [For Node.js and bundlers (Webpack, Rollup, etc)](#for-nodejs-and-bundlers-webpack-rollup-etc)
  - [Direct script tag in browser](#direct-script-tag-in-browser)
- [Usage](#usage)
  - [Example](#example)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Installation

## For Node.js and bundlers (Webpack, Rollup, etc)

```bash
npm i data-transfer-object
# or
yarn add data-transfer-object
```

## Direct script tag in browser

UMD builds aren't available yet.

# Usage

Create a DTO class by importing `DataTransferObject` and extending it with your custom properties. This package re-exports all decorators and functions from `class-validator`.

Note that when using TypeScript with `"strict": true`, you must use non-null assertions (`!:`) when declaring class properties. Also, `experimentalDecorators` and `emitDecoratorMetadata` must be set to `true` in your `tsconfig.json`.

```typescript
// input-dtos.ts

import { DataTransferObject, IsString } from 'data-transfer-object';

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

### Example

Take for example the following Express request handler, which signs up an user.

```typescript
// signup-controller.ts

import { Request, Response } from 'express';
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
  await Users.register(input);

  // Use `.toJSON()` to get a plain object with just your data.
  // `.toJSON()` is automatically called when a DTO instance is stringified.
  const data = input.toJSON();
  typeof input.validate === 'function';
  typeof data.validate === 'undefined';

  return res.status(200).json({ success: true });
}
```
