import { Interaction, User } from "discord.js"
import Client from "@bot/client"
import { OnMessage } from "@database/users"
import logger from "@functions/logger"
import { ExtendedButtonInteraction, ExtendedCommandInteraction, ExtendedSelectMenuInteraction, extendInteraction } from "@bot/extends/ExtendInteraction"

export const callback = async (_: Client, _interaction: Interaction) => {
    const interaction = await extendInteraction(_interaction)
    try {
        if (interaction.isCommand()) commandInteraction(interaction as ExtendedCommandInteraction)
        if (interaction.isSelectMenu()) selectMenuInteraction(interaction as ExtendedSelectMenuInteraction)
        if (interaction.isButton()) buttonInteraction(interaction as ExtendedButtonInteraction)
    } catch (err) { logger.Error(err) }
}

const commandInteraction = (interaction: ExtendedCommandInteraction) => {
    console.log(interaction.commandName, (interaction.client as Client).interactions)
    OnMessage((interaction.user as User).id, interaction.guildId, true)
        ; (interaction.client as Client).interactions.get(interaction.commandName)?.callback(interaction)
}

const selectMenuInteraction = (interaction: ExtendedSelectMenuInteraction) => {
    (interaction.client as Client).interactions.get(interaction.customId.split(";")[0])?.callback(interaction)
}

const buttonInteraction = (interaction: ExtendedButtonInteraction) => {
    (interaction.client as Client).interactions.get(interaction.customId.split(";")[0])?.callback(interaction)
}

export const name = "interactionCreate"