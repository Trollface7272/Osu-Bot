import { GetUser, RefreshToken } from "@database/users"
import { iUser } from "@interfaces/database"
import { GameModes } from "@osuapi/consts"
import { OsuProfile } from "@osuapi/endpoints/profile"
import { BestParams, Score } from "@osuapi/endpoints/score"
import { Errors } from "@osuapi/error"
import { OsuApi } from "@osuapi/index"
import { iScoreHitcounts } from "@osuapi/types/score"
import { MessageEmbed, MessageOptions } from "discord.js"
import { ErrorCodes } from "./errors"
import logger from "./logger"

const DifficultyEmoteIds = [
    ["858310858303864852", "858310858362978324", "858310858311729163", "858310858165190667", "858310858299408384", "858310857909075999"],
    ["858310830269399071", "858310830847557642", "858310830763671572", "858310830671003649", "858310830927118356", "858310830714257408"],
    ["858310941186850876", "858310941208215582", "858310941178724372", "858310941263134720", "858310941170466836", "858310941182394398"],
    ["858310914922381343", "858310915279290398", "858310915053322251", "858310914959605763", "858310915241803796", "858310915266445322"],
]

export interface parsedArgs {
    Name?: string[]
    Gamemode?: 0 | 1 | 2 | 3
    GreaterThan?: number
    Best?: boolean
    Reversed?: boolean
    Specific?: number[]
    Random?: boolean
}

export const Mods = {
    Bit: {
        None: 0,
        NoFail: 1 << 0,
        Easy: 1 << 1,
        TouchDevice: 1 << 2,
        Hidden: 1 << 3,
        HardRock: 1 << 4,
        SuddenDeath: 1 << 5,
        DoubleTime: 1 << 6,
        Relax: 1 << 7,
        HalfTime: 1 << 8,
        Nightcore: 1 << 9,
        Flashlight: 1 << 10,
        Autoplay: 1 << 11,
        SpunOut: 1 << 12,
        Relax2: 1 << 13,
        Perfect: 1 << 14,
        Key4: 1 << 15,
        Key5: 1 << 16,
        Key6: 1 << 17,
        Key7: 1 << 18,
        Key8: 1 << 19,
        FadeIn: 1 << 20,
        Random: 1 << 21,
        Cinema: 1 << 22,
        Target: 1 << 23,
        Key9: 1 << 24,
        KeyCoop: 1 << 25,
        Key1: 1 << 26,
        Key3: 1 << 27,
        Key2: 1 << 28,
        ScoreV2: 1 << 29,
        Mirror: 1 << 30
    },
    Names: {
        None: "No Mod",
        NoFail: "NF",
        Easy: "EZ",
        TouchDevice: "TD",
        Hidden: "HD",
        HardRock: "HR",
        SuddenDeath: "SD",
        DoubleTime: "DT",
        Relax: "RX",
        HalfTime: "HT",
        Nightcore: "NC",
        Flashlight: "FL",
        Autoplay: "AU",
        SpunOut: "SO",
        Relax2: "AP",
        Perfect: "PF",
        Key4: "4K",
        Key5: "5K",
        Key6: "6K",
        Key7: "7K",
        Key8: "8K",
        FadeIn: "FI",
        Random: "RD",
        Cinema: "CN",
        Target: "TP",
        Key9: "9K",
        KeyCoop: "2P",
        Key1: "1K",
        Key3: "3K",
        Key2: "2K",
        ScoreV2: "V2",
        Mirror: "MR"
    },
}

export const ParseArgs = (args: string[]): parsedArgs => {
    let out: parsedArgs = { Name: [], Gamemode: 0, Specific: [] }
    for (let i = 0; i < args.length; i++) {
        const el = args[i];
        switch(el) {
            case "m":
                const mode = parseInt(args[i + 1], 10)
                if (mode >= 0 && mode <= 3) {
                    out.Gamemode = mode as 0 | 1 | 2 | 3
                    i++
                }
                break
            case "b":
            case "r":
                out.Best = true
                break
            case "g":
                out.GreaterThan = parseFloat(args[i+1])
                i++
                break
            case "rv":
                out.Reversed = true
                break
            case "rand":
                out.Random = true
                break
            default:
                const num = parseInt(el, 10)
                if (!isNaN(num) && num <= 100 && num > 0) {
                    out.Specific.push(num)
                } else out.Name.push(el)


        }
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
    let [user, err]: [iUser, any] = await HandlePromise(GetUser(userId))

    const profileOptions = { id: Name[0], mode: Mode, self: false, token: user?.osu?.token || undefined }
    if (Name?.length == 0)
        if (user?.osu?.token)
            profileOptions.self = true

    if (!profileOptions.self && Name?.length == 0) throw { error: ErrorCodes.ProfileNotLinked }

    if (profileOptions.token && user.osu.expireDate.getTime() < Date.now()) {
        user = await RefreshToken(user._id) as iUser
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

export const GetOsuTopPlays = async (userId: string, Name: string[], Mode: 0 | 1 | 2 | 3, options: BestParams): Promise<Score | MessageOptions> => {
    const profileOptions = await GetOsuProfileOptions(userId, Name, Mode)
    const [scores, err] = await HandlePromise<Score>(OsuApi.Score.GetBest({...profileOptions, ...options}))
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

export const ConvertBitModsToMods = (mods: number): string => {
    if (mods == 0) return "No Mod"

    let resultMods = ""
    if (mods & Mods.Bit.Perfect) mods &= ~Mods.Bit.SuddenDeath
    if (mods & Mods.Bit.Nightcore) mods &= ~Mods.Bit.DoubleTime
    for (const mod in Mods.Bit) {
        if (Mods.Bit[mod] & mods)
            resultMods += Mods.Names[mod]
    }
    return resultMods
}

export const GetFlagUrl = (country: string): string => {
    return `https://flagcdn.com/w80/${country.toLowerCase()}.png`
}

export const GetProfileLink = (id: number, mode: 0 | 1 | 2 | 3): string => {
    return `https://osu.ppy.sh/users/${id}/${GameModes[mode]}`
}

export const GetDifficultyEmote = (mode: 0 | 1 | 2 | 3, star: number) => {
    let difficulty = 0
    if (star > 2) difficulty++
    if (star > 2.7) difficulty++
    if (star > 4) difficulty++
    if (star > 5.3) difficulty++
    if (star > 6.5) difficulty++
    return `<:Black:${DifficultyEmoteIds[mode][difficulty]}>`
}