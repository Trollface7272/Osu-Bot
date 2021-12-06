import logger from "@functions/logger"
import { iUser } from "@interfaces/database"
import axios from "axios"

export const GetUser = async (userId: string, name?: string): Promise<iUser> => {
    const res = await axios.post("http://localhost:727/users/get", { userId, name, secret: process.env.SECRET }, {}).catch(e => logger.Error(e))
    if (!res || res.status !== 200) return //TODO: HANDLE ERROR
    return res.data
}

export const OnMessage = async (userId: string, guildId: string, isCommand: boolean) => {
    await axios.post("http://localhost:727/users/onmessage", { userId, guildId, isCommand }).catch(e => logger.Error(e))
}