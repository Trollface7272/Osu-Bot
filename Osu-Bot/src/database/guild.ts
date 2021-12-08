import logger from "@functions/logger"
import { iGuild } from "@interfaces/database"
import axios from "axios"

export const GetGuild = async (guildId: string, name?: string) => {
    const data = await axios.post("http://localhost:727/guilds/get", {guildId, name, secret: process.env.SECRET}).catch(e => logger.Error(e))
    
    if (!data || data.status !== 200) return
    return data.data as iGuild
}

export const GetPrefix = async (guildId: string) => {
    const guild = await GetGuild(guildId)
    return guild?.prefix || ":"
}