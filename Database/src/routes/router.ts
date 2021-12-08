import { Router } from "express"
import auth from "./auth"
import users from "./users"
import guilds from "./guilds"
export const router = Router()

router.use("/users", users)
router.use("/guilds", guilds)
router.use("/auth", auth)