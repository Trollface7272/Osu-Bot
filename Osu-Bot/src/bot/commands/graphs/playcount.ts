import { Message, MessageAttachment, MessageOptions } from "discord.js"
import { OsuApi } from "@osuapi/index"
import { ParseArgs, parsedArgs } from "@functions/utils"
import { GetUser } from "@database/users"
import { OsuGraph } from "@functions/canvasUtils"

const playcountGraph = async (userId: string, {Name}: parsedArgs): Promise<MessageOptions> => {
    const user = await GetUser(userId)
    
    const profileOptions = {id: Name[0], mode: 0 as const, self: false, token: undefined}
    if (user?.osu?.token) profileOptions.token = `Bearer ${user.osu.token}`
    if (Name?.length == 0)
        if (user?.osu?.token) {
            profileOptions.self = true
        }
    const profile = await OsuApi.Profile.FromId(profileOptions)
    const buffer = await OsuGraph(profile.MonthlyPlaycounts.map(e => e.count), {reverse:false})
    return {files: [new MessageAttachment(buffer, "playcount.png")]}
}

export const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args)
    const msg = await playcountGraph(message.author.id, params)
    msg.allowedMentions = {repliedUser: false}
    message.reply(msg)
}

export const name = ["playcount", "pc"]