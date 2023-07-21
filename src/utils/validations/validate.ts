import { NextFunction, Request, Response } from "express";
import { ValidationChain, validationResult } from "express-validator";
import { GenericError } from "../../errors";

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request<any>, res: Response, next: NextFunction) => {
    await Promise.allSettled(
      validations.map((validation) => validation.run(req))
    );

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const fields = errors.array().map((item) => item.param);
    return next(
      new GenericError(
        "FormError",
        { failedFields: fields },
        { failedFields: fields }
      )
    );
  };
};
