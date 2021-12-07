import { Message, MessageAttachment, MessageOptions } from "discord.js"
import { GetOsuProfile, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { OsuGraph } from "@functions/canvasUtils"
import { OsuProfile } from "@osuapi/endpoints/profile"
import { ErrorCodes, ErrorHandles } from "@functions/errors"

const playcountGraph = async (userId: string, {Name}: parsedArgs): Promise<MessageOptions> => {
    const [profile, err] = await HandlePromise<OsuProfile>(GetOsuProfile(userId, Name))
    if (err) {
        if (err.error == ErrorCodes.ProfileNotLinked) return ErrorHandles.ProfileNotLinked()
        return ErrorHandles.Unknown(err)
    }
    const buffer = await OsuGraph(profile.MonthlyPlaycounts.map(e => e.count), {reverse:false})
    return {files: [new MessageAttachment(buffer, "playcount.png")]}
}

const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args)
    const msg = await playcountGraph(message.author.id, params)
    msg.allowedMentions = {repliedUser: false}
    message.reply(msg)
}

const name = ["playcount", "pc"]

export const messageCommand = {
    name,
    callback: messageCallback
}