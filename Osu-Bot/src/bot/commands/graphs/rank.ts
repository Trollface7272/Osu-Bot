import { Message, MessageAttachment, MessageEmbed, MessageOptions } from "discord.js"
import { GetOsuProfile, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { OsuGraph } from "@functions/canvasUtils"
import { OsuProfile } from "@osuapi/endpoints/profile"
import { ErrorCodes } from "@functions/errors"

const rankGraph = async (userId: string, {Name, Gamemode}: parsedArgs): Promise<MessageOptions> => {
    console.log(Name, Gamemode, userId);
    
    const [profile, err] = await HandlePromise<OsuProfile>(GetOsuProfile(userId, Name, Gamemode))
    if (err) {
        if (err.error == ErrorCodes.ProfileNotLinked) return {embeds: [new MessageEmbed().setDescription("Please link your profile using /link.").setColor("RANDOM")]}
        return err
    }
    console.log("got profile")
    const buffer = await OsuGraph(profile.RankHistory.data, {reverse:true})
    return {files: [new MessageAttachment(buffer, "rank.png")]}
}

const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args)
    const msg = await rankGraph(message.author.id, params)
    msg.allowedMentions = {repliedUser: false}
    message.reply(msg).catch(err => null)
}

const name = ["rank"]
export const messageCommand = {
    name,
    callback: messageCallback
}