import { Message, MessageAttachment, MessageOptions } from "discord.js"
import { HandlePromise, osuGraphBgColorPlugin, ParseArgs, parsedArgs } from "@functions/utils"
import { ErrorHandles } from "@functions/errors"
import { ChartJSNodeCanvas } from "chartjs-node-canvas"
import { Score } from "@osuapi/endpoints/score"
import { OsuApi } from "@osuapi/index"
import { GetUser } from "@database/users"
import { Utils } from "@osuapi/functions"
import moment from "moment-timezone"

const rankGraph = async (userId: string, { Name, Gamemode }: parsedArgs): Promise<MessageOptions> => {
    let osuId = await Utils.lookupName(Name ?? (await GetUser(userId)).osu.id as any, userId)
    const [top, err] = await HandlePromise<Score.Best[]>(OsuApi.Score.GetBest({ OAuthId: userId, id: osuId, limit: 100, mode: Gamemode, offset: 0 }))
    if (err) {
        if (err.error && ErrorHandles[err.error]) return ErrorHandles[err.error](err)
        return ErrorHandles.Unknown(err)
    }
    const times: number[] = Array(24).fill(0, 0, 24)

    const timezone = moment.tz.zonesForCountry(top[0].User.CountryCode)[0]
    top.map(el => {
        const time = moment(el.CreatedAt).tz(timezone)
        times[time.hour()]++
    })
    const labels: string[] = []
    for (let i = 0; i < 24; i++) {
        labels.push(i / 12 >= 1 ? i - 12 + "pm" : i + "am")
    }
    
    const canvas = new ChartJSNodeCanvas({ width: 1200, height: 400 })
    const buffer = await canvas.renderToBuffer({
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                data: times,
                backgroundColor: Array(24).fill("rgba(255, 159, 64, 0.8)"),
                borderColor: Array(24).fill("rgba(255, 159, 64)"),
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        text: "Score count",
                        display: true,
                        color: "rgb(100, 100, 100)",
                        font: {
                            size: 20
                        }
                    }
                },
                x: {
                    title: {
                        text: "Time",
                        display: true,
                        color: "rgb(100, 100, 100)",
                        font: {
                            size: 20
                        }
                    }
                }
            }
        },
        plugins: [osuGraphBgColorPlugin]
    })
    return { files: [new MessageAttachment(buffer, "scores.png")], allowedMentions: { repliedUser: false } }
}

const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args, message.content.toLocaleLowerCase().split(" ")[0])
    const msg = await rankGraph(message.author.id, params)
    message.reply(msg).catch(() => null)
}

const name = ["toptimes", "tt"]
export const messageCommand = {
    name,
    callback: messageCallback
}