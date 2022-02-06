import { Request, Response, Router } from "express"

const router = Router()

router.get("/", (req: Request, res: Response) => {
    console.log(req.query);
    let {site} = req.query
    if (!site || typeof site !== "string" || site.includes("epictrolled")) return res.send("Error")
    if (!site.includes("://")) site = "https://" + site
    res.send(`<meta http-equiv="refresh" content="0; url=${site}" />`)
})




export default router