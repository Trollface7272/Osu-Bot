import { Message, MessageAttachment, MessageOptions } from "discord.js"
import { GetOsuProfile, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { OsuGraph } from "@functions/canvasUtils"
import { ErrorHandles } from "@functions/errors"
import { Profile } from "@osuapi/endpoints/profile"

const replaysGraph = async (userId: string, { Name, Gamemode }: parsedArgs): Promise<MessageOptions> => {
    const [profile, err] = await HandlePromise<Profile.FromId>(GetOsuProfile(userId, Name, Gamemode))
    if (err) {
        if (err.error && ErrorHandles[err.error]) return ErrorHandles[err.error](err)
        return ErrorHandles.Unknown(err)
    }
    const datesWithData = profile.WatchedReplays.map(e => ({ date: new Date(e.start_date), data: e.count }))
    const data: number[] = []
    const labels: string[] = []
    for (let i = datesWithData[0].date.getFullYear(); i <= new Date().getFullYear(); i++) {
        const start = i == datesWithData[0].date.getFullYear() ? datesWithData[0].date.getMonth() : 0
        const end = i == new Date().getFullYear() ? new Date().getMonth() + 1 : 12
        for (let j = start; j < end; j++) {
            const e = datesWithData.find(e => e.date.getFullYear() === i && e.date.getMonth() === j)
            labels.push(`${j+1}.${i}`)
            data.push(e?.data || 0)
        }

    }
    const buffer = await OsuGraph(data, {
        reverse: false, labels, fill: "start", yLines: true,
        yTitle: {
            display: true,
            text: "Replays Watched",
            color: "rgb(100,100,100)",
            font: {
                size: 20
            }
        }
    })
    return { files: [new MessageAttachment(buffer, "watched_replays.png")] }
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