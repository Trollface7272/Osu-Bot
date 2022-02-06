import { GetUser, RefreshToken } from "@database/users"
import logger from "@functions/logger"
import { OAuth2Manager } from "api/oAuth2/oAuth"
import axios, { AxiosError, AxiosRequestConfig } from "axios"
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
}