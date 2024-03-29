import consola, { LogLevel } from "consola"
import { MessageEmbed, TextChannel } from "discord.js"

consola.wrapConsole()
if (process.env.NODE_ENV == "development") consola.level = LogLevel.Verbose
else consola.level = LogLevel.Info
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

const Debug = (...messages: any[]) => {
    console.info(...messages)
}

const Error = (...messages: any[]) => {
    console.error(...messages)
    console.trace()

    const msgs = messages.map(m => { try { return m.toString() } catch (err) { return null } }).filter(e => e !== null)
    logChannel?.send({
        embeds: [new MessageEmbed({
            color: "RANDOM",
            description: msgs.join("\n")
        })]
    })
}


export default { Log, Warn, Info, Error, Debug }