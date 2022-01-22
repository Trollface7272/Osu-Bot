import { RegisterEventListener } from "@database/events"
import { HandlePromise } from "@functions/utils"
import { iMessageCommand } from "@interfaces/command"
import { Message, PermissionString } from "discord.js"

const Register = async (channelId: string, type: string) => {
    const [, err] = await HandlePromise(RegisterEventListener(type, channelId))
    if (!err) return "👍"
    else return "👎"
}

const messageCallback = async (message: Message, args: string[]) => {
    if (args[0] === "register" || args[0] === "add") {
        return message.react(await Register(message.channel.id, args[1]))
    }
}

const name = ["event", "events"]

const permissions: PermissionString[] = ["MANAGE_CHANNELS"]

export const messageCommand: iMessageCommand = {
    name,
    permissions: permissions,
    callback: messageCallback
}