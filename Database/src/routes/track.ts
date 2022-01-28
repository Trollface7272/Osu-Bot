import { Request, Response, Router } from "express";
import { AddToTracking, GetTracked } from "../database/tracking";
import { ValidateSecret } from "../functions/utils";

const router = Router()

router.use(ValidateSecret)

router.post("/add", async (req: Request, res: Response) => {
    const { id, name, channelId, mode, limit, performance } = req.body

    if (id == null || name == null || channelId == null || mode == null || limit == null || performance == null) return res.status(400).send()
    await AddToTracking(id, name, channelId, mode, limit, performance)
    res.json()
})

router.post("/get", async (req: Request, res: Response) => {
    let { offset } = req.body

    if (offset == null) offset = 0
    res.json(await GetTracked(offset))
})


export default router