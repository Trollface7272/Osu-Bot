import { ApplicationCommandData, Interaction, Message } from "discord.js"

export interface iMessageCommand {
    name: string
    callback: (message: Message, args: string[]) => void
}

export interface iInteractionCommand {
    name: string
    data: ApplicationCommandData
    callback: (interaction: Interaction) => void
}

export interface iCommandFile {
    messageCommand: iMessageCommand
    interactionCommand: iInteractionCommand
}