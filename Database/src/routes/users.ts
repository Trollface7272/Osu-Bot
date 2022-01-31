import { Request, Response, Router } from "express"
import { addTempKey, GetUser, onMessage, RefreshOsuToken } from "../database/users"
import { HandleAsync, ValidateSecret } from "../functions/utils"
import { onMessage as gOnMessage } from "../database/guild"
import axios from "axios"

const router = Router()

router.use("/", ValidateSecret)

router.post("/get", async (req: Request, res: Response) => {
    const { userId, name } = req.body
    if (userId == null) return res.status(400).send()

    res.json(await GetUser({ userId, name }))
})

router.post("/onmessage", (req: Request, res: Response) => {
    const { userId, guildId, isCommand } = req.body
    if (userId == null || isCommand == null || guildId == null) return res.status(400).send()

    onMessage(userId, isCommand)
    gOnMessage(guildId, isCommand)
    res.status(200).send()
})

router.post("/addtempsecret", (req: Request, res: Response) => {
    const { userId, key, scopes } = req.body
    if (userId == null || key == null || scopes == null) return res.status(400).send()

    addTempKey(userId, key, scopes)
    res.status(200).send()
})

router.post("/refreshtoken", async (req: Request, res: Response) => {
    const { id, accessToken, tokenType, refreshToken, expires, scopes } = req.body
    if (!id || !accessToken || !tokenType || !refreshToken || !expires || !scopes) return res.status(400).send()
    const [r, err] = (await HandleAsync(axios.get("https://osu.ppy.sh/api/v2/me/osu", { headers: {Authorization: `${tokenType} ${accessToken}`}})))
    if (err) return console.error(err)
    const name = r.data.username

    const user = await RefreshOsuToken({ id, accessToken, tokenType, refreshToken, expires: new Date(expires), scopes, name })
    res.status(200).json(user)
})

export default router