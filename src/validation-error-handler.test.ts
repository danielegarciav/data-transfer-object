import * as validation_error_handler from "./validation-error-handler"
// @ponicode
describe("validation_error_handler.setValidationErrorHandler", () => {
    test("0", () => {
        let callFunction: any = () => {
            validation_error_handler.setValidationErrorHandler(() => undefined, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("validation_error_handler.clearValidationErrorHandler", () => {
    test("0", () => {
        let callFunction: any = () => {
            validation_error_handler.clearValidationErrorHandler()
        }
    
        expect(callFunction).not.toThrow()
    })
})
