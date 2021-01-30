# [0.3.0](https://github.com/danielegarciav/data-transfer-object/compare/v0.2.1...v0.3.0) (2021-01-27)

### Bug Fixes

- **types:** skip function types properly ([6c1a7d4](https://github.com/danielegarciav/data-transfer-object/commit/6c1a7d48f4de8ac58dcc4cf832213373024988ce))

  - The type of the object returned by `toJSON()` was erroneously including function names in its return type. This has been fixed.

    ```typescript
    import { DataTransferObject, IsString } from 'data-transfer-object';

    class MyDto extends DataTransferObject {
      @IsString()
      key!: string;
    }

    const input = new MyDto({ key: 'value' });
    const data = input.toJSON();

    // before 0.3.0
    typeof data = {
      key: string;
      toJSON: never;
      validate: never;
      validateAsync: never;
    }

    // 0.3.0 onwards
    typeof data = {
      key: string;
    }
    ```

## [0.2.1](https://github.com/danielegarciav/data-transfer-object/compare/v0.2.0...v0.2.1) (2021-01-26)

- this release marks this package as side effects free

# [0.2.0](https://github.com/danielegarciav/data-transfer-object/compare/v0.1.0...v0.2.0) (2021-01-26)

### Bug Fixes

- use symbols for private properties ([03f4d24](https://github.com/danielegarciav/data-transfer-object/commit/03f4d248d123bd64601dc49a96af741679a8037b))

# 0.1.0 (2021-01-26)

- initial release 🎉
