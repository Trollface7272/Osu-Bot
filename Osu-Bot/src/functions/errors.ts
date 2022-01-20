import { MessageOptions } from "discord.js"
import logger from "./logger"

export enum ErrorCodes {
    Unknown="Unknown",
    ProfileNotLinked="ProfileNotLinked",
    InvalidAccessToken="InvalidAccessToken"
}

const InvalidAccessToken = (): MessageOptions => {
    return {
        content: "Please re-link your profile using /link"
    }
}

const ProfileNotLinked = (): MessageOptions => {
    return {
        content: "Please link your profile using /link"
    }
}

const Unknown = (err: any) => {
    logger.Error(err)
    return {
        content: "Unknown error occured!"
    }
}

export const ErrorHandles = {
    ProfileNotLinked,
    Unknown,
    InvalidAccessToken
}