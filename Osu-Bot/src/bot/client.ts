import { Client as dClient, Collection, Intents, TextChannel } from "discord.js"
import { promisify } from "util"
import { iEvent } from "@interfaces/event"
import { iCommandFile, iInteractionCommand, iMessageCommand } from "@interfaces/command"

import glob from "glob"
import logger, { SetLogChannel } from "@functions/logger"
import { CheckForNewMaps } from "./other/RankedBeatmps"
import { CheckForOsuNews } from "./other/News"
import { RunTracking } from "./other/Tracking"

export const gPromise = promisify(glob)

class Client extends dClient {
    public commands: Collection<string, iMessageCommand> = new Collection()
    public interactions: Collection<string, iInteractionCommand> = new Collection()
    public events: Collection<string, iEvent> = new Collection()
    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_VOICE_STATES,
                Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS
            ]
        })
        this.once("ready", async () => {
            logger.Info(`Logged in as ${this.user.tag}`)
            const commandFiles: string[] = await gPromise(`${__dirname}/commands/**/*{.ts,.js}`)
            const guild = await this.guilds.fetch("341153679992160266")
            commandFiles.map(async (value: string) => {
                const file: iCommandFile = await import(value)

                const command = file.messageCommand
                if (command)
                    for (let i = 0; i < command.name.length; i++)
                        this.commands.set(command.name[i], command)

                const interaction = file.interactionCommand
                if (interaction) {
                    this.interactions.set(interaction.name, interaction)
                    if (interaction.data)
                        guild.commands.create(interaction.data)
                }
            })
            const eventFiles: string[] = await gPromise(`${__dirname}/events/**/*{.ts,.js}`)
            eventFiles.map(async (value: string) => {
                const file: iEvent = await import(value)
                this.events.set(file.name, file)
                this.on(file.name, file.callback.bind(null, this))
            })
            SetLogChannel(await (await this.guilds.fetch("341153679992160266")).channels.fetch("909270388624732160") as TextChannel)
            setInterval(() => { RunTracking(this) }, 1000 * 60)
            setInterval(() => { CheckForNewMaps(this) }, 1000 * 60)
            setInterval(() => { CheckForOsuNews(this) }, 1000 * 60 * 10)
            CheckForNewMaps(this)
            CheckForOsuNews(this)
            RunTracking(this)
        })
    }
    public async Start(token: string) {
        this.login(token)
    }
}

export default Client