import { Message } from "discord.js";

export interface iCommand {
    name: string
    messageCallback: (message: Message) => void
}