import { Client as dClient, Collection, Intents } from "discord.js"
import { promisify } from "util"
import { iEvent } from "@interfaces/event"
import { iCommand } from "@interfaces/command"

import glob from "glob"
import logger from "@functions/logger"
import PreStart from "@prestart/index"
import { iInteraction } from "@interfaces/interaction"

export const gPromise = promisify(glob)

class Client extends dClient {
    public commands: Collection<string, iCommand> = new Collection()
    public interactions: Collection<string, iInteraction> = new Collection()
    public events: Collection<string, iEvent> = new Collection()
    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_VOICE_STATES,
            ]
        })
        this.once("ready", async () => {
            logger.Info(`Logged in as ${this.user.tag}`)
            const interactionFiles: string[] = await gPromise(`${__dirname}/interactions/**/*{.ts,.js}`)
            interactionFiles.map(async (value: string) => {
                const file: iInteraction = await import(value)
                this.interactions.set(file.name, file)
                ;(await this.guilds.fetch("341153679992160266")).commands.create(file.data)
            })

        })
    }
    public async Start(token: string) {
        await PreStart()
        const commandFiles: string[] = await gPromise(`${__dirname}/commands/**/*{.ts,.js}`)
        commandFiles.map(async (value: string) => {
            const file: iCommand = await import(value)
            for (let i = 0; i < file.name.length; i++) 
                this.commands.set(file.name[i], file)
        })
        const eventFiles: string[] = await gPromise(`${__dirname}/events/**/*{.ts,.js}`)
        eventFiles.map(async (value: string) => {
            const file: iEvent = await import(value)
            this.events.set(file.name, file)
            this.on(file.name, file.callback.bind(null, this))
        })
        this.login(token)
    }
}

export default Client