import { ApplicationCommandData, Interaction, Message, PermissionString } from "discord.js"

export interface iMessageCommand {
    name: string[]
    permissions: PermissionString[]
    callback: (message: Message, args: string[]) => Promise<any>
}

export interface iInteractionCommand {
    name: string
    data: ApplicationCommandData
    permissions: PermissionString[]
    callback: (interaction: Interaction) => void
}

export interface iCommandFile {
    messageCommand: iMessageCommand
    interactionCommand: iInteractionCommand
}