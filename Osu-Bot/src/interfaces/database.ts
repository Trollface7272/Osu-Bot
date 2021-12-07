export interface iUser {
    _id: string,
    name: string,
    messages: number,
    commands: number,
    osu: { token?: string, refresh?: string, name?: string, expireDate?: Date }
}

export interface iGuild {
    _id: string
    name: string
    prefix: string
    messages: number
    commands: number
}