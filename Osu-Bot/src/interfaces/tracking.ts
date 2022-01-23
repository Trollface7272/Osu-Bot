

export interface TrackedUser {
    id: number
    name: string
    channels: { channelId: string, limit: number }[]
    mode: 0 | 1 | 2 | 3
    isLast: boolean
    lastCheck: Date
}