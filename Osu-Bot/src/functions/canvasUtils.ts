import { ChartJSNodeCanvas } from "chartjs-node-canvas"

interface GraphOptions {
    reverse?: boolean
}
export const OsuGraph = async (data: number[], { reverse }: GraphOptions) => {
    const canvas = new ChartJSNodeCanvas({ width: 400, height: 200 })
    const buffer = await canvas.renderToBuffer({
        type: "line",
        data: {
            labels: Array(data.length).fill(""),
            datasets: [{
                label: "",
                data: data,
                fill: false,
                borderColor: "rgb(255, 208, 49)",
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
                "y2": {
                    reverse
                },
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