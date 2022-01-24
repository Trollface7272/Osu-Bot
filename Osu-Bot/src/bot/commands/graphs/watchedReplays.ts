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
    const datesWithData = profile.ReplaysWatched.map(e => ({date: new Date(e.start_date), data: e.count}))
    const data: number[] = []
    for (let i = 0; i < datesWithData.length-1; i++) {
        const el1 = datesWithData[i];
        const el2 = datesWithData[i+1];
        data.push(el1.data)
        const emptyMonths = (el2.date.getMonth() - el1.date.getMonth() + (el2.date.getFullYear() - el2.date.getFullYear()) * 12) - 1
        for (let i = 0; i < emptyMonths; i++) data.push(0)
        if (datesWithData.length-2 == i) data.push(el2.data)
    }
    const buffer = await OsuGraph(data, { reverse: false })
    return { files: [new MessageAttachment(buffer, "watched_replays.png")], allowedMentions: { repliedUser: false } }
}

const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args, message.content.toLocaleLowerCase().split(" ")[0])
    const msg = await replaysGraph(message.author.id, params)
    message.reply(msg)
}

const name = ["watchedreplays", "wr"]

export const messageCommand = {
    name: name,
    callback: messageCallback
}