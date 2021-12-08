import consola from "consola"
import { MessageEmbed, TextChannel } from "discord.js"

consola.wrapAll()
let logChannel: TextChannel
export const SetLogChannel = (channel: TextChannel) => logChannel = channel
const Log = (...messages: any[]) => {
    console.log(...messages)
}

const Warn = (...messages: any[]) => {
    console.warn(...messages)
}

const Info = (...messages: any[]) => {
    console.info(...messages)
}

const Error = (...messages: any[]) => {
    console.error(...messages)
    logChannel?.send({
        embeds: [new MessageEmbed({
            color: "RANDOM",
            description: messages.join("\n")
        })]
    })
}


export default { Log, Warn, Info, Error }