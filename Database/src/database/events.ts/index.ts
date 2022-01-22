import { connection, Types } from "mongoose"


const collection = connection.collection("events")

const EventIds = {
    ranked: "61eb67cac52f98aa2e761b1f",
    qualified: "61eb7494c52f98aa2e761b20"
}
export const Register = (type: string, channelId: string) => {
    const id = EventIds[type]
    if (!id) return

    collection.updateOne({ _id: new Types.ObjectId(id) }, { $addToSet: { RegisteredChannels: channelId } })
}

export const Load = async (type: string) => {
    const id = EventIds[type]
    if (!id) return

    const event = await collection.findOne({ _id: new Types.ObjectId(id) })
    if (!event) return 
    return { RegisteredChannels: event.RegisteredChannels, LastChecked: event.LastCheck }
}

export const Checked = async (type: string) => {
    const id = EventIds[type]
    if (!id) return

    collection.updateOne({ _id: new Types.ObjectId(id) }, { $set: { LastCheck: new Date() } })
}