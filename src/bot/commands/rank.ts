import { Message, MessageAttachment } from "discord.js"
import { ChartJSNodeCanvas } from "chartjs-node-canvas"
import logger from "@functions/logger"
import { OsuApi } from "@osuapi/index"


export const messageCallback = async (message: Message) => {
    const profile = await OsuApi.Profile.FromId("8398988", 0)
    const canvas = new ChartJSNodeCanvas({ width: 400, height: 200 })
    const buffer = await canvas.renderToBuffer({
        type: "line",
        data: {
            labels: Array(profile.RankHistory.data.length).fill(""),
            datasets: [{
                label: "Test",
                data: profile.RankHistory.data,
                fill: false,
                borderColor: "rgb(255, 208, 49)",
                showLine: true,
                tension: 0.1
            }],
        },
        options: {
            backgroundColor: "#1d1f20ff",
            color:"#ffd031",
            elements: {
                point: {
                    radius: 0
                },
                line: {
                    borderWidth: 2
                }
            },
            scales: {
                "y2": {
                    reverse: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    })
    
    message.reply({files: [new MessageAttachment(buffer, "profile-rank.png")]})
}

export const name = ["rank"]