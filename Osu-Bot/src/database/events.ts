import { HandlePromise } from "@functions/utils"
import { dbEvent } from "@interfaces/event"
import { SilentPost } from "@osuapi/functions"


export const GetEvents = async (type: string) => {
    const [events, err] = await HandlePromise<dbEvent>(SilentPost("http://localhost:727/events/load", { type, update: false }))
    return events
}
export const UpdateEvent = async (type: string, date: Date) => {
    await HandlePromise(SilentPost("http://localhost:727/events/checked", { type, date: date.toString() }))
}
export const RegisterEventListener = async (type: string, channelId: string, args: { mode: (0 | 1 | 2 | 3)[] }) => {
    return await HandlePromise(SilentPost("http://localhost:727/events/register", { type, channelId, ...args }))
}