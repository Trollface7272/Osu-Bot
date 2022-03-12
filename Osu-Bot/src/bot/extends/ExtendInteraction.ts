import { ButtonInteraction, CommandInteraction, Interaction, SelectMenuInteraction } from "discord.js"
import { ExtendedGuild, extendGuild } from "./Guild"
import { ExtendedUser, extendUser } from "./User"

export type ExtendedInteraction = {
    user: ExtendedUser
    guild: ExtendedGuild
} & Interaction

export type ExtendedCommandInteraction = {
    user: ExtendedUser
    guild: ExtendedGuild
} & CommandInteraction

export type ExtendedButtonInteraction = {
    user: ExtendedUser
    guild: ExtendedGuild
} & ButtonInteraction

export type ExtendedSelectMenuInteraction = {
    user: ExtendedUser
    guild: ExtendedGuild
} & SelectMenuInteraction

export const extendInteraction = async (interaction: Interaction): Promise<Interaction> => {
    await extendGuild(interaction.guild)
    await extendUser(interaction.user)
    return interaction as unknown as Interaction
}