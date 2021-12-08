import { NextFunction, Request, Response, Router } from "express"
import { addTempKey, GetUser, onMessage } from "../database/users"
import { ValidateSecret } from "../functions"
import { onMessage as gOnMessage } from "../database/guild"

const router = Router()

router.use("/", ValidateSecret)

router.post("/get", async (req: Request, res: Response) => {
    const {userId, name} = req.body
    if (userId == null) return res.status(400).send()

    res.json(await GetUser({userId, name}))
})

router.post("/onmessage", (req: Request, res: Response) => {
    const {userId, guildId, isCommand} = req.body
    if (userId == null || isCommand == null || guildId == null) return res.status(400).send()

    onMessage(userId, isCommand)
    gOnMessage(guildId, isCommand)
    res.status(200).send()
})

router.post("/addtempsecret", (req: Request, res: Response) => {
    const {userId, key} = req.body
    if (userId == null || key == null) return res.status(400).send()

    addTempKey(userId, key)
    res.status(200).send()
})


export default router