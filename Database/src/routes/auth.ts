import { Request, Response, Router } from "express";
import axios, { AxiosError } from "axios"
import { SetOsuToken } from "../database/users";

const router = Router()
//https://osu.ppy.sh/oauth/authorize?redirect_uri=http://localhost:727/auth&response_type=code&client_id=11234&state=290850421487042560
router.get("/", async (req: Request, res: Response) => {
    const { state, code } = req.query
    const resp = await axios.post("https://osu.ppy.sh/oauth/token", {
        client_id: process.env.OSUID,
        client_secret: process.env.OSU,
        redirect_uri: process.env.OSUURL,
        code,
        grant_type: "authorization_code"
    }).catch((err: AxiosError) => {
        console.log(err)
        return
    })
    if (!resp) return res.status(500).send()
    
    const rawData = resp.data
    const data = {
        tokenType: rawData.token_type,
        expireDate: new Date(rawData.expires_in + Date.now()),
        token: rawData.access_token,
        refresh: rawData.refresh_token
    }

    SetOsuToken(state as string, data, req.headers["cf-connecting-ip"] as string)
    res.send("<script>close()</script>")
})

export default router