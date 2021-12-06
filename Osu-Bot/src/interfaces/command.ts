import { interactionCallback as Link } from "@bot/commands/link";
import { Message } from "discord.js";

export interface iCommand {
    name: string
    messageCallback: (message: Message, args: string[]) => void
}

export const callback = Link