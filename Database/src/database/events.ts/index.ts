import { connection, Types } from "mongoose"


const collection = connection.collection("events")

const EventIds = {
    ranked: "61eb67cac52f98aa2e761b1f",
    qualified: "61eb7494c52f98aa2e761b20",
    news: "61ec033b6f2480889a5ad55f"
}
export const Register = (type: string, channelId: string, data: any = {}) => {
    const id = EventIds[type]
    if (!id) return

    collection.updateOne({ _id: new Types.ObjectId(id) }, { $addToSet: { RegisteredChannels: { id: channelId, ...data } } })
}

export const Load = async (type: string) => {
    const id = EventIds[type]
    if (!id) return

    const event = await collection.findOne({ _id: new Types.ObjectId(id) })
    if (!event) return
    return { RegisteredChannels: event.RegisteredChannels, LastChecked: event.LastCheck }
}

export const Checked = async (type: string, date: Date) => {
    const id = EventIds[type]
    if (!id) return

    collection.updateOne({ _id: new Types.ObjectId(id) }, { $set: { LastCheck: date } })
}