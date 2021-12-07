import { MessageOptions } from "discord.js"
import logger from "./logger"

export enum ErrorCodes {
    Unknown,
    ProfileNotLinked
}

const ProfileNotLinked = (): MessageOptions => {
    return {
        content: "Please link your profile using /link"
    }
}

const Unknown = (err: any) => {
    logger.Error(err)
    return { }
}

export const ErrorHandles = {
    ProfileNotLinked,
    Unknown
}