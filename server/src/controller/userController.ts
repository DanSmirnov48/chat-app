import express, { NextFunction, Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";

export const signup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    return res.status(200).json({ status: 'success' }).end();
});