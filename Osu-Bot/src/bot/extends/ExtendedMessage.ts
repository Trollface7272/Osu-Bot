import { Message } from "discord.js"
import { ExtendedGuild, extendGuild } from "./Guild"
import { ExtendedUser, extendUser } from "./User"

export type ExtendedMessage = {
    author: ExtendedUser
    guild: ExtendedGuild
} & Message

export const extendMessage = async (message: Message): Promise<ExtendedMessage> => {
    await extendGuild(message.guild)
    await extendUser(message.author)
    return message as unknown as ExtendedMessage
}