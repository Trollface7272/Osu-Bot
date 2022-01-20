import { ErrorHandles } from "@functions/errors"
import logger from "@functions/logger"
import { GetOsuProfile, GetOsuTopPlays, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { OsuProfile } from "@osuapi/endpoints/profile"
import { UserBest } from "@osuapi/endpoints/score"
import { CommandInteraction, Message, MessageOptions } from "discord.js"


const osuTop = async (userId: string, {Name, Gamemode}: parsedArgs): Promise<MessageOptions> => {
    const [profile, err] = await HandlePromise<OsuProfile>(GetOsuProfile(userId, Name, Gamemode))
    if (err) {
        if (err.error && ErrorHandles[err.error]) return ErrorHandles[err.error](err) 
        return ErrorHandles.Unknown(err)
    }

    const [scores, err2] = await HandlePromise<UserBest>(GetOsuTopPlays(userId, Name, Gamemode))
    if (err2) {
        if (err2.error && ErrorHandles[err2.error]) return ErrorHandles[err2.error](err2) 
        return ErrorHandles.Unknown(err2)
    }
    logger.Debug(profile, scores)
}


const messageCallback = async (message: Message, args: string[]) => {
    const parsedArgs = ParseArgs(args)
    
    const data = await osuTop(message.author.id, parsedArgs)

    message.reply(data)
}

const interactionCallback = (interaction: CommandInteraction) => {

}

const name = ["top", "osutop", "maniatop", "ctbtop", "fruitstop", "taikotop"]
export const messageCommand = {
    name,
    callback: messageCallback
}

export const interactionCommand = {
    name: "osu profile",
    callback: interactionCallback
}