import { NextFunction, Request, Response } from "express";

// const asyncHandler = (fn: any) => (
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
// ) => {
//     Promise.resolve(fn(req, res, next)).catch(next);
// }

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};

export default asyncHandler