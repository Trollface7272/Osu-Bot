import { GetUser } from "@database/users"
import { iUser } from "@interfaces/database"
import { User } from "discord.js"

export type ExtendedUser = {
    data: iUser
} & User

export const extendUser = async (user: User) => {
    Reflect.defineProperty(user, "data", { value: await GetUser(user.id, user.tag) })
    return User as unknown as ExtendedUser
}