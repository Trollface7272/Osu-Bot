import { Message, MessageAttachment, MessageOptions } from "discord.js"
import { ChartJSNodeCanvas } from "chartjs-node-canvas"
import logger from "@functions/logger"
import { OsuApi } from "@osuapi/index"
import { ParseArgs, parsedArgs } from "@functions/utils"
import { GetUser } from "@database/users"
import { OsuGraph } from "@functions/canvasUtils"

const rankGraph = async (userId: string, {Name}: parsedArgs): Promise<MessageOptions> => {
    const user = await GetUser(userId)
    
    const profileOptions = {id: Name[0], mode: 0 as const, self: false, token: undefined}
    if (user?.osu?.token) profileOptions.token = `Bearer ${user.osu.token}`
    if (Name?.length == 0)
        if (user?.osu?.token) {
            profileOptions.self = true
        }
    const profile = await OsuApi.Profile.FromId(profileOptions)
    const buffer = await OsuGraph(profile.RankHistory.data, {reverse:true})
    return {files: [new MessageAttachment(buffer, "rank.png")]}
}

export const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args)
    const msg = await rankGraph(message.author.id, params)
    msg.allowedMentions = {repliedUser: false}
    message.reply(msg)
}

export const name = ["rank"]