import { CommandInteraction, Interaction, SelectMenuInteraction, User } from "discord.js"
import Client from "@bot/client"
import { OnMessage } from "@database/users"

export const callback = (_: Client, interaction: Interaction) => {
    if (interaction.isCommand()) commandInteraction(interaction as CommandInteraction)
    if (interaction.isSelectMenu()) selectMenuInteraction(interaction as SelectMenuInteraction)
}

const commandInteraction = (interaction: CommandInteraction) => {
    console.log(interaction.commandName, (interaction.client as Client).interactions)
    OnMessage((interaction.user as User).id, interaction.guildId, true)
    ;(interaction.client as Client).interactions.get(interaction.commandName).callback(interaction)
}

const selectMenuInteraction = (interaction: SelectMenuInteraction) => {
    (interaction.client as Client).interactions.get(interaction.customId.split(";")[0]).callback(interaction)
}

export const name = "interactionCreate"