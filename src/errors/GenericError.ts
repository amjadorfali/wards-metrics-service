
export type ErrorCode = "InternalError" | "FormError"

export class GenericError extends Error {
  errorCode: ErrorCode;
  errorData: object | undefined;

  constructor(errorCode: ErrorCode, debugData?: object, errorData?: object) {
    super("");
    this.errorCode = errorCode;
    this.errorData = errorData;
    if (errorCode !== "InternalError") {
   //   logger.error(`Error: ${errorCode}`, {data: debugData});
    }
  }
}
