export interface iUser {
    _id: string,
    name: string,
    messages: number,
    commands: number,
    osu: { token?: string, refresh?: string, name?: string, expireDate: Date, tokenType: "Bearer" }
}