import { GetGuild } from "@database/guild"
import { iGuild } from "@interfaces/database"
import { Guild } from "discord.js"

export type ExtendedGuild = {
    data: iGuild
} & Guild

export const extendGuild = async (guild: Guild): Promise<ExtendedGuild> => {
    Reflect.defineProperty(guild, "data", {value: await GetGuild(guild.id, guild.name)})
    return Guild as unknown as ExtendedGuild
}