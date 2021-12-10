import { interactionCallback as Link } from "@bot/commands/link";
import { ApplicationCommandData } from "discord.js";


export const name = "link"
export const data: ApplicationCommandData = {
    name: "link",
    description: "Link your osu profile",
    type: "CHAT_INPUT"
}
export const interactionCallback = Link