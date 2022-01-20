import { GradeEmotes } from "@consts/osu"
import { ErrorHandles } from "@functions/errors"
import logger from "@functions/logger"
import { CalculateAcc, DateDiff, GetCombo, GetHits, GetOsuProfile, GetOsuTopPlays, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { OsuProfile } from "@osuapi/endpoints/profile"
import { UserBest } from "@osuapi/endpoints/score"
import { CommandInteraction, Message, MessageOptions } from "discord.js"


const FormatTopPlay = async (Gamemode: 0 | 1 | 2 | 3, score: UserBest): Promise<string> => {
    const beatmap = score.Beatmap

    let fcppDisplay = "", description = ""
    if (score.MaxCombo < score.MaxCombo - 15 || score.Counts.miss > 0) fcppDisplay = `(${score.FcPerformance.toLocaleString()}pp for ${RoundFixed(score.FcAccuracy)}% FC) `
    description += `**${score.Index}. [${beatmap.Title} [${beatmap.Version}]](${GetMapLink(beatmap.id)}) +${ConvertBitMods(score.Mods)}** [${beatmap.Formatted.Difficulty.Star}★]\n`
    description += `▸ ${GradeEmotes[score.Rank]} ▸ **${score.Formatted.Performance}pp** ${fcppDisplay}▸ ${CalculateAcc(score.Counts, Gamemode)}%\n`
    description += `▸ ${score.Formatted.Score} ▸ ${GetCombo(score.Combo, beatmap.Combo, Gamemode)} ▸ [${GetHits(score.Counts, Gamemode)}]\n`
    description += `▸ Score Set ${DateDiff(score.Date, new Date(new Date().toLocaleString('en-US', { timeZone: "UTC" })))}Ago\n`

    return description
}

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