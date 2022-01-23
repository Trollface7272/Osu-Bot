import { connection } from "mongoose"

const collection = () => connection.collection("tracking")

export const AddToTracking = async (id: number, name: string, channelId: string, mode: 0 | 1 | 2 | 3, limit: number) => {
    const d = await collection().findOne({ id, mode })
    if (d) return collection().updateOne({ _id: d._id }, { $addToSet: { channels: { id: channelId, limit } }, $set: { name } })
    return collection().insertOne({ id, name, channels: [{ channelId, limit }], mode, lastCheck: new Date() })
}

export const GetTracked = async (offset: number) => {
    const cursor = collection().find({})
    let user = await cursor.next()
    for (let i = 0; i < offset; i++) if (await cursor.hasNext()) user = await cursor.next()
    
    collection().updateOne({_id: user._id}, {$set: { lastCheck: new Date() }})
    return { ...user, isLast: await cursor.hasNext() }
}