import { ChartJSNodeCanvas } from "chartjs-node-canvas"
import { osuGraphBgColorPlugin } from "./utils"

interface GraphOptions {
    reverse?: boolean
    labels?: string[]
    xTitle?: {
        text: string
        color?: string
        display?: boolean
        font?: {
            size?: 20
            family?: string
            lineHeight?: number
            style?: "normal" | "italic" | "oblique" | "initial" | "inherit"
            weight?: string
        }
    }
    yTitle?: {
        text: string
        color?: string
        display?: boolean
        font?: {
            size?: 20
            family?: string
            lineHeight?: number
            style?: "normal" | "italic" | "oblique" | "initial" | "inherit"
            weight?: string
        }
    }
    fill?: string
    xLines?: boolean
    yLines?: boolean
}
export const OsuGraph = async (data: number[], { reverse, labels, xTitle, yTitle, fill, xLines, yLines }: GraphOptions) => {
    const canvas = new ChartJSNodeCanvas({ width: 800, height: 300 })
    const buffer = await canvas.renderToBuffer({
        type: "line",
        data: {
            labels: labels || Array(data.length).fill(""),
            datasets: [{
                data: data,
                fill: fill,
                borderColor: "rgb(255, 208, 49)",
                backgroundColor: "rgba(255, 208, 49, 0.2)",
                showLine: true,
                tension: 0
            }],
        },
        options: {
            backgroundColor: "#1d1f20ff",
            color: "#ffd031",
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
                    title: yTitle,
                    reverse,
                    grid: {display: yLines ?? false}
                },
                "x2": {
                    title: xTitle,
                    grid: {display: xLines ?? false} 
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        },
        plugins: [osuGraphBgColorPlugin]
    })
    return buffer
}

export const BeatmapFailTimes = async (fail: number[], exit: number[]) => {
    const canvas = new ChartJSNodeCanvas({ width: 367, height: 100 })
    const buffer = await canvas.renderToBuffer({
        type: "bar",
        data: {
            labels: Array(fail.length).fill(""),
            datasets: [{
                label: "",
                data: exit,
                fill: false,
                backgroundColor: "rgb(255, 255, 0)",
                showLine: true,
                tension: 0.1
            }, {
                label: "",
                data: fail,
                fill: false,
                backgroundColor: "rgb(255, 0, 0)",
                showLine: true,
                tension: 0.1
            }],
        },
        options: {
            backgroundColor: "#1d1f20ff",
            color: "#ffd031",
            elements: {
                point: {
                    radius: 0
                },
                line: {
                    borderWidth: 2
                }
            },
            scales: {
                "x2": {
                    grid: {
                        color: "rgba(0, 0, 0, 0)"
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    })
    return buffer
}