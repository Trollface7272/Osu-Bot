import { NextFunction, Request, Response } from "express"

export const ValidateSecret = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.secret == process.env.SECRET) return next()
    return res.status(403).send()
}