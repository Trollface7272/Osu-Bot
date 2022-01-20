import { Message, MessageAttachment, MessageEmbed, MessageOptions } from "discord.js"
import { GetOsuProfile, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { OsuGraph } from "@functions/canvasUtils"
import { OsuProfile } from "@osuapi/endpoints/profile"
import { ErrorCodes, ErrorHandles } from "@functions/errors"

const rankGraph = async (userId: string, {Name, Gamemode}: parsedArgs): Promise<MessageOptions> => {
    const [profile, err] = await HandlePromise<OsuProfile>(GetOsuProfile(userId, Name, Gamemode))
    if (err) {
        if (err.error && ErrorHandles[err.error]) return ErrorHandles[err.error](err) 
        return ErrorHandles.Unknown(err)
    }
    const buffer = await OsuGraph(profile.RankHistory.data, {reverse:true})
    return {files: [new MessageAttachment(buffer, "rank.png")], allowedMentions: {repliedUser: false}}
}

const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args)
    const msg = await rankGraph(message.author.id, params)
    message.reply(msg).catch(err => null)
}

const name = ["rank"]
export const messageCommand = {
    name,
    callback: messageCallback
}