import { GetUser, RefreshToken } from "@database/users"
import { iUser } from "@interfaces/database"
import { OsuProfile } from "@osuapi/endpoints/profile"
import { UserBest } from "@osuapi/endpoints/score"
import { Errors } from "@osuapi/error"
import { OsuApi } from "@osuapi/index"
import { iScoreHitcounts } from "@osuapi/types/score"
import { MessageEmbed, MessageOptions } from "discord.js"
import { ErrorCodes } from "./errors"
import logger from "./logger"

export interface parsedArgs {
    Name?: string[],
    Gamemode?: 0 | 1 | 2 | 3
}

export const ParseArgs = (args: string[]): parsedArgs => {
    let out: parsedArgs = { Name: [], Gamemode: 0 }
    for (let i = 0; i < args.length; i++) {
        const el = args[i];
        if (el == "m") {
            const mode = parseInt(args[i + 1])
            if (mode >= 0 && mode <= 3) {
                out.Gamemode = mode as 0 | 1 | 2 | 3
                i++
            }
        }
        out.Name.push(el)
    }
    return out
}

export const GetOsuToken = async (discordId: string, discordName: string) => {
    const data = await GetUser(discordId, discordName)
    if (!data.osu.token) return //TODO: Handle no user set
    if (data.osu.expireDate.getTime() - Date.now() < 0) return //TODO: Refresh token
    return data.osu.token
}

const GetOsuProfileOptions = async (userId: string, Name: string[], Mode: 0 | 1 | 2 | 3) => {
    let user: iUser | void = await GetUser(userId)

    const profileOptions = { id: Name[0], mode: Mode, self: false, token: user?.osu?.token || undefined }
    if (Name?.length == 0)
        if (user?.osu?.token)
            profileOptions.self = true

    if (!profileOptions.self && Name?.length == 0) throw { error: ErrorCodes.ProfileNotLinked }

    if (profileOptions.token && user.osu.expireDate.getTime() < Date.now()) {
        user = await RefreshToken(user._id)
        if (!user) throw { error: ErrorCodes.InvalidAccessToken }
        profileOptions.token = user.osu.token
    }

    if (profileOptions.self) profileOptions.id = user.osu.name
    return profileOptions
}

const HandleApiError = (err: any) => {
    const resp = new MessageEmbed().setColor("RANDOM")
    switch (err.code) {
        case Errors.BadToken:
            throw {
                embeds: [resp.setDescription("Please relink your profile.")]
            }
        case Errors.PlayerDoesNotExist:
            throw {
                embeds: [resp.setDescription("Player does not exist.")]
            }
        case Errors.WrongEndpoint:
        case Errors.Unknown:
        default:
            logger.Error(err)
            throw {
                embeds: [resp.setDescription("Unknown error occured")]
            }
    }
}

export const GetOsuProfile = async (userId: string, Name: string[], Mode: 0 | 1 | 2 | 3): Promise<OsuProfile | MessageOptions> => {
    const profileOptions = await GetOsuProfileOptions(userId, Name, Mode)
    const [profile, err] = await HandlePromise(OsuApi.Profile.FromId(profileOptions))
    if (err) return HandleApiError(err)
    return profile
}

export const GetOsuTopPlays = async (userId: string, Name: string[], Mode: 0 | 1 | 2 | 3): Promise<UserBest | MessageOptions> => {
    const profileOptions = await GetOsuProfileOptions(userId, Name, Mode)
    const [scores, err] = await HandlePromise<UserBest>(OsuApi.Score.GetBest(profileOptions))
    if (err) return HandleApiError(err)
    return scores
}

export const HandlePromise = async <T>(promise: Promise<any>): Promise<[T, any]> => {
    try {
        const res = await promise
        return [res, null]
    } catch (err) {
        return [null, err]
    }
}





export const GetCombo = (combo: number, maxCombo: number, mode: number): string => {
    if (mode == 3) return `x${combo}`
    return `x${combo}/${maxCombo}`
}

export const DateDiff = (date1: Date, date2: Date) => {
    const diff: number = date2.getTime() - date1.getTime()
    const out: string[] = []
    const years: number = Math.floor(diff / 1000 / 60 / 60 / 24 / 30 / 12)
    if (years > 0) out.push(`${years} Year${years > 1 ? "s" : ""} `)

    const months: number = Math.floor(diff / 1000 / 60 / 60 / 24 / 30 % 12)
    if (months > 0) out.push(`${months} Month${months > 1 ? "s" : ""} `)

    const days: number = Math.floor(diff / 1000 / 60 / 60 / 24 % 30)
    if (days > 0) out.push(`${days} Day${days > 1 ? "s" : ""} `)

    const hours: number = Math.floor(diff / 1000 / 60 / 60 % 24)
    if (hours > 0) out.push(`${hours} Hour${hours > 1 ? "s" : ""} `)

    const minutes: number = Math.floor(diff / 1000 / 60 % 60)
    if (minutes > 0) out.push(`${minutes} Minute${minutes > 1 ? "s" : ""} `)

    const seconds: number = Math.floor(diff / 1000 % 60)
    out.push(`${seconds} Second${seconds > 1 ? "s" : ""} `)

    return out[0] + (out[1] || "")
}

export const GetHits = (counts: iScoreHitcounts, mode: number): string => {
    switch (mode) {
        case 1:
        case 0:
            return `${counts[300]}/${counts[100]}/${counts[50]}/${counts.miss}`
        case 2:
            return `${counts[300]}/${counts[100]}/${counts[50]}/${counts.katu}/${counts.miss}`
        case 3:
            return `${counts.geki}/${counts[300]}/${counts.katu}/${counts[100]}/${counts[50]}/${counts.miss}`
        default:
            logger.Error(`Unknown gamemode: ${mode}`)
            return "Unknown"
    }
}

export const CalculateAcc = (counts: iScoreHitcounts, mode: number): string => {
    switch (mode) {
        case 0:
            return Math.round(((counts[300] * 300 + counts[100] * 100 + counts[50] * 50) / ((counts[300] + counts[100] + counts[50] + counts.miss) * 300) * 100)).toFixed(2)
        case 1:
            return Math.round(((counts[300] + counts[100] * 0.5) / (counts[300] + counts[100] + counts.miss) * 100)).toFixed(2)
        case 2:
            return Math.round(((counts[300] + counts[100] + counts[50]) / (counts[300] + counts[100] + counts[50] + counts.miss + counts.katu) * 100)).toFixed(2)
        case 3:
            return Math.round(((300 * (counts[300] + counts.geki) + 200 * counts.katu + 100 * counts[100] + 50 * counts[50]) / (300 * (counts.geki + counts[300] + counts.katu + counts[100] + counts[50] + counts.miss)) * 100 * 100) / 100).toFixed(2)
        default:
            logger.Error(`Unknown gamemode: ${mode}`)
            return "Unknown"
    }
}