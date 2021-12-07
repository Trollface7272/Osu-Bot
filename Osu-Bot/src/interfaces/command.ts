import { ApplicationCommandData, CommandInteraction, Message } from "discord.js"

export interface iMessageCommand {
    name: string
    callback: (message: Message, args: string[]) => void
}

export interface iInteractionCommand {
    name: string
    data: ApplicationCommandData
    callback: (interaction: CommandInteraction) => void
}

export interface iCommandFile {
    messageCommand: iMessageCommand
    interactionCommand: iInteractionCommand
}