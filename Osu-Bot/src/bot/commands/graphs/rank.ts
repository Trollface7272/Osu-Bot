import { Message, MessageAttachment, MessageOptions } from "discord.js"
import { GetOsuProfile, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { OsuGraph } from "@functions/canvasUtils"
import { ErrorCodes, ErrorHandles } from "@functions/errors"
import { OsuProfile } from "@osuapi/endpoints/profile"

const rankGraph = async (userId: string, {Name}: parsedArgs): Promise<MessageOptions> => {
    const [profile, err] = await HandlePromise<OsuProfile>(GetOsuProfile(userId, Name))
    if (err) {
        if (err.error == ErrorCodes.ProfileNotLinked) return ErrorHandles.ProfileNotLinked()
        return ErrorHandles.Unknown(err)
    }
    const buffer = await OsuGraph(profile.RankHistory.data, {reverse:true})
    return {files: [new MessageAttachment(buffer, "rank.png")]}
}

const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args)
    const msg = await rankGraph(message.author.id, params)
    msg.allowedMentions = {repliedUser: false}
    message.reply(msg)
}

const name = ["rank"]
export const messageCommand = {
    name,
    callback: messageCallback
}