export interface iUser {
    _id: string,
    name: string,
    messages: number,
    commands: number,
    osu: iUserOsu
}

export interface iUserOsu {
    token?: string,
    tokenType?: string
    refresh?: string,
    name?: string,
    expireDate?: Date
    scopes?: string
}

export interface iGuild {
    _id: string
    name: string
    prefix: string
    messages: number
    commands: number
}