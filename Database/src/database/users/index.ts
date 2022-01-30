import { connection } from "mongoose"
import logger from "../../functions/logger"
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
    logger.Log(data)
    const user = await collection.findOne({ "osu.secret": key })
    data.scopes = user.osu.scopes
    await collection.updateOne({ "osu.secret": key }, { $set: { osu: data, ip } })
}

export const RefreshOsuToken = async (data: { id: string, accessToken: string, tokenType: string, refreshToken: string, expires: Date, scopes: string, name: number }) => {
    //@ts-ignore
    const resp = await collection.updateOne({ _id: userId }, { $set: { osu: data } })
}

export const onMessage = async (userId: string, isCommand: boolean) => {
    let inc = isCommand ? { messages: 1, commands: 1 } : { messages: 1 }
    //@ts-ignore
    const updated = (await collection.updateOne({ _id: userId }, { $inc: inc }))
    //@ts-ignore
    if (updated.modifiedCount == 0) CreateUser({ userId })
}

export const addTempKey = (userId: string, key: string, scopes: string) => {
    //@ts-ignore
    collection.updateOne({ _id: userId }, { $set: { osu: { secret: key, scopes } } })
}