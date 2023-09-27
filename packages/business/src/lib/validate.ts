import {validationResult} from 'express-validator';

export function validateMiddleware(validations: any) {
  return async (req: any, res: any, next: any) => {
    await Promise.all(validations.map((validation: any) => validation.run(req)));
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    const errorObject = {} as any;
    errors.array().forEach((error) => (errorObject[error.param] = error));
    res.status(422).json({errors: errorObject});
  };
}
