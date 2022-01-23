import { TrackedUser } from "@interfaces/tracking"
import axios from "axios"


export const TrackUser = async (id: number, name: string, channelId: string, mode: 0 | 1 | 2 | 3, limit: number) => {
    const resp = await axios.post("http://localhost:727/tracking/add", { id, name, channelId, mode, limit, secret: process.env.SECRET })
}

export const GetTracked = async (offset: number): Promise<TrackedUser> => {
    const resp = (await axios.post("http://localhost:727/tracking/get", { secret: process.env.SECRET, offset })).data as TrackedUser
    resp.lastCheck = new Date(resp.lastCheck)
    return resp
}