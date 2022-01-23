import { Router } from "express"
import auth from "./auth"
import users from "./users"
import guilds from "./guilds"
import events from "./events"
import tracking from "./track"
export const router = Router()

router.use("/users", users)
router.use("/guilds", guilds)
router.use("/auth", auth)
router.use("/events", events)
router.use("/tracking", tracking)