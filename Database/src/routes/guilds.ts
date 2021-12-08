import { Request, Response, Router } from "express"
import { GetGuild, SetGuildName } from "../database/guild"
import { ValidateSecret } from "../functions/utils"

const router = Router()

router.use("/", ValidateSecret)

router.post("/get", async (req: Request, res: Response) => {
    const { guildId, name } = req.body
    if (!guildId) res.status(400).send()
    if (name) SetGuildName(guildId, name)
    res.status(200).json(await GetGuild(guildId))
})

export default router