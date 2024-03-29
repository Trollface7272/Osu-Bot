import { Message } from "discord.js"
import Client from "@bot/client"
import { OnMessage } from "@database/users"
import logger from "@functions/logger"
import { extendMessage } from "@bot/extends/ExtendedMessage"

export const callback = async (_: Client, _message: Message) => {
    if (_message.author.bot) return
    let message = await extendMessage(_message)
    
    const prefix = process.env.NODE_ENV == "development" ? "." : message.guild.data.prefix
    if (!message.content.startsWith(prefix)) return OnMessage(message.author.id, message.guildId, false)
    OnMessage(message.author.id, message.guildId, true)
    
    let args = message.content.toLowerCase().split(" ")
    const command = args.shift().substring(prefix.length)
    args = parseArgs(args)
    const callback = (message.client as Client).commands.get(command)?.callback
    
    
    if (!callback) return
    message.channel.sendTyping()
    try { await callback(message, args) }
    catch (err) {
        if (err?.includes && err.includes("Cannot send an empty message")) return
        else logger.Error(err)
    }
}

const parseArgs = (args: string[]) => {
    const out = []
    for (let i = 0; i < args.length; i++) {
        const el = args[i];
        if (el.startsWith("\"")) {
            const end = args.findIndex(e => e.endsWith("\""))
            if (end) out.push(args.slice(i, end))
            i = end
        } else out.push(el)
    }
    return out
}

export const name = "messageCreate"