import { Router } from "express"
import { AuthRouter } from "./auth"
import users from "./users"
export const router = Router()

router.use("/users", users)
router.use("/auth", AuthRouter)