import { ChartJSNodeCanvas } from "chartjs-node-canvas"

interface GraphOptions {
    reverse?:boolean
}
export const OsuGraph = async (data: number[], {reverse}: GraphOptions) => {
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