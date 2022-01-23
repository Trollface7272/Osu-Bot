import { Request, Response, Router } from "express"
import { Checked, Load, Register } from "../database/events.ts"
import { ValidateSecret } from "../functions/utils"

const router = Router()

router.use("/", ValidateSecret)

router.post("/register", (req: Request, res: Response) => {
    const { type, channelId, secret, ...rest } = req.body
    if (!type  || !channelId) res.status(400).send()
    Register(type, channelId, rest)
    res.json()
})

router.post("/load", async (req: Request, res: Response) => {
    const { type, update } = req.body
    if (!type) res.status(400).send()
    res.json(await Load(type))
    if (update) Checked(type)
})

export default router