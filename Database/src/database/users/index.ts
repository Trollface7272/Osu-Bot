import { connection } from "mongoose"
import logger from "../../functions/logger"
import { DEFAULT_SCOPES } from "../../functions/utils"
import { iUser } from "./interfaces"
import { UserModel } from "./schema"
const collection = connection.collection("users")

const CreateUser = ({ userId, name }: { userId: string, name?: string }) => {
    const user = new UserModel()
    user._id = userId
    user.commands = 0
    user.messages = 0
    user.osu = {}
    user.name = name || ""
    user.save()
    return user
}

export const GetUser = async ({ userId, name }: { userId: string, name?: string }): Promise<iUser> => {
    const response = await collection.findOne<iUser>({
        //@ts-ignore
        _id: userId
    })
    //@ts-ignore
    if (!response) return CreateUser({ userId, name: name || "" })
    return response
}

export const SetOsuToken = async (key: string, data: { token: string, refresh: string, expireDate: Date, tokenType: string, scopes?: string }, ip: string) => {
    const user = await collection.findOne({ "osu.secret": key })
    data.scopes = user?.osu?.scopes || DEFAULT_SCOPES 
    await collection.updateOne({ "osu.secret": key }, { $set: { osu: data, ip } })
}

export const RefreshOsuToken = async ({ id, tokenType, accessToken, expires, refreshToken, name, scopes }: { id: string, accessToken: string, tokenType: string, refreshToken: string, expires: Date, scopes: string, name: number }) => {
    const resp = await collection.updateOne({ _id: id }, {
        $set: {
            osu: {
                tokenType: tokenType,
                token: accessToken,
                expireDate: expires,
                refresh: refreshToken,
                id: name,
                scopes: scopes
            }
        }
    })
}

export const onMessage = async (userId: string, isCommand: boolean) => {
    let inc = isCommand ? { messages: 1, commands: 1 } : { messages: 1 }
    //@ts-ignore
    await collection.updateOne({ _id: userId }, { $inc: inc })

}

export const addTempKey = (userId: string, key: string, scopes: string) => {
    //@ts-ignore
    collection.updateOne({ _id: userId }, { $set: { osu: { secret: key, scopes } } })
}