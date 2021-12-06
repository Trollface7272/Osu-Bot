import { Request, Response, Router } from "express";
import axios from "axios"
import { SetOsuToken } from "../database/users";

export const AuthRouter = Router()
//https://osu.ppy.sh/oauth/authorize?redirect_uri=http://localhost:727/auth&response_type=code&client_id=11234&state=290850421487042560
AuthRouter.get("/", async (req: Request, res: Response) => {
    const { state, code } = req.query
    const resp = (await axios.post("https://osu.ppy.sh/oauth/token", {
        client_id: process.env.OSUID,
        client_secret: process.env.OSU,
        redirect_uri: process.env.OSUURL,
        code,
        grant_type: "authorization_code"
    })).data
    const data = {
        tokenType: resp.token_type,
        expireDate: new Date(resp.expires_in + Date.now()),
        token: resp.access_token,
        refresh: resp.refresh_token
    }

    SetOsuToken(state as string, data)
    res.send("<script>close()</script>")
})