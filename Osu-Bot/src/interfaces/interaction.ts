import { ApplicationCommandData, CommandInteraction } from "discord.js";

export interface iInteraction {
    data: ApplicationCommandData,
    name: string,
    interactionCallback: (interaction: CommandInteraction) => any
}