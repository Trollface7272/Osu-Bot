import { connection } from "mongoose"
import { GuildModel } from "./schema"

const collection = connection.collection("guilds")

const CreateGuild = ({ guildId, name }: { guildId: string, name?: string }) => {
    const guild = new GuildModel()
    guild._id = guildId
    guild.commands = 0
    guild.messages = 0
    guild.name = name || "unknown"
    guild.prefix = "!"
    guild.save()
    return guild
}

export const GetGuild = async (guildId: string) => {
    const guild = await collection.findOne({ _id: guildId })
    return guild || CreateGuild({guildId})
}

export const SetGuildName = async (guildId: string, name: string) => {
    collection.updateOne({ _id: guildId }, { $set: { name } })
}

export const onMessage = async (guildId: string, isCommand: boolean) => {
    let inc = isCommand ? { messages: 1, commands: 1 } : { messages: 1 }
    const updated = await collection.updateOne({ _id: guildId }, { $inc: inc })
}