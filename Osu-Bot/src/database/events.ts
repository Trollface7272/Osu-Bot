import { HandlePromise } from "@functions/utils"
import { dbEvent } from "@interfaces/event"
import { Utils } from "@osuapi/functions"
//      |  
//TODO: V
const Post = Utils.Post

export const GetEvents = async (type: string) => {
    const [events, err] = await HandlePromise<dbEvent>(Post("http://localhost:727/events/load", { type, update: false }))
    return events
}
export const UpdateEvent = async (type: string, date: Date) => {
    await HandlePromise(Post("http://localhost:727/events/checked", { type, date: date.toString() }))
}
export const RegisterEventListener = async (type: string, channelId: string, args: { mode: (0 | 1 | 2 | 3)[] }) => {
    return await HandlePromise(Post("http://localhost:727/events/register", { type, channelId, ...args }))
}