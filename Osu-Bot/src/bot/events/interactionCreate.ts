import { CommandInteraction, Interaction } from "discord.js"
import Client from "@bot/client"

export const callback = (_: Client, interaction: Interaction) => {
    if (interaction.isCommand()) commandInteraction(interaction as CommandInteraction)
}

const commandInteraction = (interaction: CommandInteraction) => {
    console.log(interaction.commandName, (interaction.client as Client).interactions);
    
    (interaction.client as Client).interactions.get(interaction.commandName).interactionCallback(interaction)
}

export const name = "interactionCreate"