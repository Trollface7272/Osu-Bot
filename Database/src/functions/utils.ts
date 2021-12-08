import axios from "axios"
import { NextFunction, Request, Response } from "express"
import { GetUser, RefreshOsuToken } from "../database/users"
import logger from "./logger"

export const ValidateSecret = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.secret == process.env.SECRET) return next()
    return res.status(403).send()
}

export const RefreshToken = async (userId: string) => {
    const user = await GetUser({userId})
    if (!user) return //TODO: Handle error
    const resp = await axios.post("https://osu.ppy.sh/oauth/token", {
        client_id: process.env.OSUID,
        client_secret: process.env.OSU,
        refresh_token: user.osu.refresh,
        score: "public",
        grant_type: "refresh_token"
    }, { validateStatus: () => false }).catch(err => logger.Error(err))
    if (!resp) return
    if (resp.status !== 200) return resp.data.message == "The refresh token is invalid." ? { error: 5, message: "Invalid Refresh Token"} : {}
    const rawData = resp.data
    const data = {
        tokenType: rawData.token_type,
        expireDate: new Date(rawData.expires_in + Date.now()),
        token: rawData.access_token,
        refresh: rawData.refresh_token
    }
    logger.Log(data)
    RefreshOsuToken(userId, data)
    user.osu = data
    return user
}