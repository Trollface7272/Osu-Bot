import { Request, Response, Router } from "express";
import axios, { AxiosError } from "axios"
import { SetOsuToken } from "../database/users";
import { join } from "path";
import logger from "../functions/logger";
import { HandleAsync } from "../functions/utils";

const router = Router()
const paths = {
    fail: join(__dirname, "..", "html", "fail.html"),
    success: join(__dirname, "..", "html", "success.html")
}
//https://osu.ppy.sh/oauth/authorize?redirect_uri=http://localhost:727/auth&response_type=code&client_id=11234&state=290850421487042560
router.get("/", async (req: Request, res: Response) => {
    const { state, code } = req.query
    if (!state || !code) return res.status(200).sendFile(paths.fail)
    const [resp, err2] = await HandleAsync(axios.post("https://osu.ppy.sh/oauth/token", {
        client_id: process.env.OSUID,
        client_secret: process.env.OSU,
        redirect_uri: process.env.OSUURL, 
        code,
        grant_type: "authorization_code"
    }))
    if (err2) return logger.Error(err2)
    if (!resp) return res.status(200).sendFile(paths.fail)
    
    const rawData = resp.data
    const data = {
        tokenType: rawData.token_type,
        expireDate: new Date(rawData.expires_in * 1000 + Date.now()),
        token: rawData.access_token,
        refresh: rawData.refresh_token,
        id: null
    }
    const [profile, err] = await HandleAsync(axios.get("https://osu.ppy.sh/api/v2/me", {
        headers: {
            "Authorization": `${data.tokenType} ${data.token}`
        }
    }))
    if (err) return res.status(200).sendFile(paths.fail)
    data.id = profile.data.id

    SetOsuToken(state as string, data, req.headers["cf-connecting-ip"] as string)
    res.status(200).sendFile(paths.success)
})

export default router