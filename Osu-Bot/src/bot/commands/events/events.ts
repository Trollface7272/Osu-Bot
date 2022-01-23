import { RegisterEventListener } from "@database/events"
import { HandlePromise } from "@functions/utils"
import { iMessageCommand } from "@interfaces/command"
import { Message, PermissionString } from "discord.js"

interface iArgs {
    mode: (0|1|2|3)[]
}

const parseArgs = (args: string[]) => {
    const out: iArgs = { mode: [] }

    for (let i = 0; i < args.length; i++) {
        const el = args[i];
        if (el === "m") out.mode = args[i+1].split(",").map(el => parseInt(el)) as unknown as (0|1|2|3)[]
    }

    return out
}

const Register = async (channelId: string, type: string, args: iArgs) => {
    const [, err] = await HandlePromise(RegisterEventListener(type, channelId, args))
    if (!err) return "👍"
    else return "👎"
}

const messageCallback = async (message: Message, args: string[]) => {
    switch(args[0]) {
        case "add":
        case "register":
            const pArgs = parseArgs(args)
            return message.react(await Register(message.channel.id, args[1], pArgs))
    }
}

const name = ["event", "events"]

const permissions: PermissionString[] = ["MANAGE_CHANNELS"]

export const messageCommand: iMessageCommand = {
    name,
    permissions: permissions,
    callback: messageCallback
}