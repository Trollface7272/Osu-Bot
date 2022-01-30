import { GetUser, RefreshToken } from "@database/users"
import { OAuth2Manager } from "api/oAuth2/oAuth"
import axios, { AxiosRequestConfig } from "axios"

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
}