import { logger } from '../libs';
import { GenericError } from "./GenericError";

export type ErrorCode = "DeleteTaskError"

export class InternalError extends GenericError {
  constructor(errorCode: ErrorCode, debugData?: object) {
    super("InternalError");
    logger.error(
      `InternalError: ${errorCode}`,
      { data: debugData },
      new Error(`InternalError: ${errorCode}`)
    );
  }
}
