import { HandlePromise } from "@functions/utils"
import { dbEvent } from "@interfaces/event"
import { SilentPost } from "@osuapi/functions"


export const GetEvents = async (type: string) => {
    const [events, err] = await HandlePromise<dbEvent>(SilentPost("http://localhost:727/events/load", { type, update: true }))
    return events
}
export const RegisterEventListener = async (type: string, channelId: string) => {
    await HandlePromise(SilentPost("http://localhost:727/events/register", { type, channelId }))
}