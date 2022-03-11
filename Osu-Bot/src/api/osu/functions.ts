import { UsernameCache } from "@api/cache/Usernames"
import { GetUser, RefreshToken } from "@database/users"
import logger from "@functions/logger"
import { OAuth2Manager } from "api/oAuth2/oAuth"
import axios, { AxiosError, AxiosRequestConfig } from "axios"
import { OsuApi } from "."
import { Mods } from "./calculator/base"
import { Beatmaps } from "./endpoints/beatmap"
import { Errors, OsuApiError } from "./error"

export namespace Utils {

    export const Get = async (link: string, data: any, headers: any = {}, axiosOptions?: AxiosRequestConfig) => {
        return (await axios.get(link, {
            params: data,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...headers
            },
            ...axiosOptions
        })).data

    }

    export const Post = async (link: string, data: any, headers: any = {}, axiosOptions?: AxiosRequestConfig) => {
        if (link.startsWith("http://localhost:727")) data.secret = process.env.SECRET
        return (await axios.post(link, data, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...headers
            },
            ...axiosOptions
        })).data
    }

    export const HandlePromise = async <T>(promise: Promise<any>): Promise<[T, any]> => {
        try {
            const res = await promise
            return [res, null]
        } catch (err) {
            return [null, err]
        }
    }

    export const GetUserToken = async (OAuth: OAuth2Manager, OAuthId: string) => {
        let token = OAuth.GetCached(OAuthId)
        if (!token) {
            const user = await GetUser(OAuthId)
            if (user?.osu?.token) {
                token = OAuth.UserCredentials(OAuthId, user.osu.scopes, user.osu.tokenType, user.osu.refresh, user.osu.token, user.osu.expireDate, RefreshToken)
            }
        }

        return token?.GetToken() || OAuth.ClientCredentials.GetToken()
    }
    export const Error = (err: AxiosError, endpoint: string): never => {
        if (!err.response) throw new OsuApiError(Errors.Unknown, err)
        if (err.response.status == 401) throw new OsuApiError(Errors.BadToken, "Provided invalid token")
        if (err.response.status == 403) throw new OsuApiError(Errors.BadToken, "Provided invalid token")
        logger.Log(endpoint)
        if (err.response.status == 404) throw new OsuApiError(Errors.WrongEndpoint, "Provided invalid api endpoint")
        throw new OsuApiError(Errors.Unknown, err)
    }
    export const AccToCounts = (acc: number, obj: { circles: number, spinners: number, sliders: number }): { "50": number, "100": number, "300": number, miss: number, geki: number, katu: number } => {
        const objects = obj.circles + obj.sliders + obj.spinners
        let c100 = Math.round(-3.0 * ((acc * 0.01 - 1.0) * objects) * 0.5)
        if (c100 > objects) {
            c100 = 0
            const c50 = Math.round(-6.0 * ((acc * 0.01 - 1.0) * objects) * 0.5)
            return {
                "300": objects - c100 - c50,
                "100": c100,
                "50": c50,
                miss: 0,
                geki: 0,
                katu: 0
            }
        }
        return {
            "300": objects - c100,
            "100": c100,
            "50": 0,
            miss: 0,
            geki: 0,
            katu: 0
        }
    }
    export const ConvertBitModsToModsArr = (mods: number): string[] => {
        if (mods == 0) return []
    
        let resultMods = []
        if (mods & Mods.Bit.Perfect) mods &= ~Mods.Bit.SuddenDeath
        if (mods & Mods.Bit.Nightcore) mods &= ~Mods.Bit.DoubleTime
        for (const mod in Mods.Bit) {
            if (Mods.Bit[mod] & mods)
                resultMods.push(Mods.Names[mod])
        }
        return resultMods
    }
    export const lookupName = async (name: string, id: string) => {
        if (name?.isNumber()) return parseInt(name)
        const lookedUp = UsernameCache.LookUp(name)
        if (lookedUp) return lookedUp
        const user = await OsuApi.Profile.FromId({id: name, OAuthId: id})
        UsernameCache.Add(name, user.Id)
        return user.Id
    }
}