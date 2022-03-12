import { Message, MessageAttachment, MessageEmbed, MessageOptions } from "discord.js"
import { GetOsuProfile, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { OsuGraph } from "@functions/canvasUtils"
import { Profile } from "@osuapi/endpoints/profile"
import { ErrorHandles } from "@functions/errors"

const rankGraph = async (userId: string, { Name, Gamemode }: parsedArgs): Promise<MessageOptions> => {
    const [profile, err] = await HandlePromise<Profile.FromId>(GetOsuProfile(userId, Name, Gamemode))
    if (err) {
        if (err.error && ErrorHandles[err.error]) return ErrorHandles[err.error](err)
        return ErrorHandles.Unknown(err)
    }
    const buffer = await OsuGraph(profile.RankHistory.data, {
        reverse: true, yLines: true,
        yTitle: {
            display: true,
            text: "Rank",
            color: "rgb(100, 100, 100)",
            font: {
                size: 20
            }
        }
    })
    return { files: [new MessageAttachment(buffer, "rank.png")], allowedMentions: { repliedUser: false } }
}

const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args, message.content.toLocaleLowerCase().split(" ")[0])
    const msg = await rankGraph(message.author.id, params)
    message.reply(msg).catch(err => null)
}

const name = ["rank"]
export const messageCommand = {
    name,
    callback: messageCallback
}