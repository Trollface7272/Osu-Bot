import { Message, MessageAttachment, MessageOptions } from "discord.js"
import { GetOsuProfile, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { OsuGraph } from "@functions/canvasUtils"
import { Profile } from "@osuapi/endpoints/profile"
import { ErrorHandles } from "@functions/errors"

const playcountGraph = async (userId: string, {Name, Gamemode}: parsedArgs): Promise<MessageOptions> => {
    const [profile, err] = await HandlePromise<Profile.FromId>(GetOsuProfile(userId, Name, Gamemode))
    if (err) {
        if (err.error && ErrorHandles[err.error]) return ErrorHandles[err.error](err) 
        return ErrorHandles.Unknown(err)
    }
    const buffer = await OsuGraph(profile.MonthlyPlaycounts.map(e => e.count), {reverse:false})
    return {files: [new MessageAttachment(buffer, "playcount.png")], allowedMentions: {repliedUser: false}}
}

const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args, message.content.toLocaleLowerCase().split(" ")[0])
    const msg = await playcountGraph(message.author.id, params)
    message.reply(msg)
}

const name = ["playcount", "pc"]

export const messageCommand = {
    name,
    callback: messageCallback
}