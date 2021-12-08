import { connection, model } from "mongoose"
import logger from "../../functions/logger"
import { iUser } from "./interfaces"
import { UserModel, UserSchema } from "./schema"
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
        _id: userId
    })
    if (!response) return CreateUser({ userId, name: name || "" })
    return response
}

export const SetOsuToken = async (key: string, data: { token: string, refresh: string, expireDate: Date, tokenType: string }, ip: string) => {
    logger.Log(data)
    collection.updateOne({ osutempsecret: key }, { $set: { osu: data, ip }, $unset: {osutempsecret: ""} })
}

export const RefreshOsuToken = async (userId: string, data: { token: string, refresh: string, expireDate: Date, tokenType: string }) => {
    collection.updateOne({ userId }, { $set: { osu: data } })
}

export const onMessage = async (userId: string, isCommand: boolean) => {
    let inc = isCommand ? { messages: 1, commands: 1 } : { messages: 1 }
    const updated = await collection.updateOne({ _id: userId }, { $inc: inc })
    if (updated.modifiedCount == 0) CreateUser({ userId })
}

export const addTempKey = (userId: string, key: string) => {
    collection.updateOne({ _id: userId }, {$set: {osutempsecret: key}})
}