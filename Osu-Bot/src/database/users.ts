import logger from "@functions/logger"
import { iUser } from "@interfaces/database"
import axios from "axios"

export const GetUser = async (userId: string, name?: string): Promise<iUser> => {
    if (!userId) return 
    const res = await axios.post("http://localhost:727/users/get", { userId, name, secret: process.env.SECRET }, {}).catch(e => e)
    if (!res || res.status !== 200) return //TODO: HANDLE ERROR
    
    if (res.data?.osu?.expireDate) res.data.osu.expireDate = new Date(res.data.osu.expireDate)
    
    return res.data
}

export const OnMessage = async (userId: string, guildId: string, isCommand: boolean) => {
    await axios.post("http://localhost:727/users/onmessage", { userId, guildId, isCommand, secret: process.env.SECRET }).catch(e => logger.Error(e))
}

//            |
//TODO: delet V
export const RefreshToken = async (id: string, accessToken: string, tokenType: string, refreshToken: string, expires: Date, scopes: string): Promise<iUser|void> => {
    const user = await axios.post("http://localhost:727/users/refreshtoken", { id, accessToken, tokenType, refreshToken, expires, scopes, secret: process.env.SECRET }).catch(e => logger.Error(e))
    if (!user || user.status !== 200) return //TODO: handle error
    return user.data
}