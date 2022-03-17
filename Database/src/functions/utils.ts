import { NextFunction, Request, Response } from "express"

export const DEFAULT_SCOPES = "public identify"

export const ValidateSecret = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.secret == process.env.SECRET) return next()
    return res.status(403).send()
}

export const HandleAsync = async <T>(promise: Promise<T>): Promise<[T, any]> => {
    try {
        const data = await promise
        return [data, null]
    } catch (err) {
        return [null, err]
    }
}