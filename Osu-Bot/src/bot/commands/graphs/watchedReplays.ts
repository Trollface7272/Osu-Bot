import { Message, MessageAttachment, MessageOptions } from "discord.js"
import { GetOsuProfile, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { OsuGraph } from "@functions/canvasUtils"
import { ErrorHandles } from "@functions/errors"
import { OsuProfile } from "@osuapi/endpoints/profile"

const replaysGraph = async (userId: string, { Name, Gamemode }: parsedArgs): Promise<MessageOptions> => {
    const [profile, err] = await HandlePromise<OsuProfile>(GetOsuProfile(userId, Name, Gamemode))
    if (err) {
        if (err.error && ErrorHandles[err.error]) return ErrorHandles[err.error](err)
        return ErrorHandles.Unknown(err)
    }
    const buffer = await OsuGraph(profile.ReplaysWatched.map(e => e.count), { reverse: false })
    return { files: [new MessageAttachment(buffer, "watched_replays.png")], allowedMentions: { repliedUser: false } }
}

const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args)
    const msg = await replaysGraph(message.author.id, params)
    message.reply(msg)
}

const name = ["watchedreplays", "wr"]

export const messageCommand = {
    name: name,
    callback: messageCallback
}