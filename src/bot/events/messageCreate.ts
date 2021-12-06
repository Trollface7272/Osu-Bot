import { GetPrefix } from "@database/guild"
import { Message } from "discord.js"
import Client from "@bot/client"

export const callback = async (_: Client, message: Message) => {
    if (message.author.bot) return
    const prefix = await GetPrefix(message.guildId)
    if (!message.content.startsWith(prefix)) return

    let args = message.content.toLowerCase().split(" ")
    const command = args.shift().substring(prefix.length)
    args = parseArgs(args)
    const callback = (message.client as Client).commands.get(command)?.messageCallback
    
    if (!callback) return
    callback(message)
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