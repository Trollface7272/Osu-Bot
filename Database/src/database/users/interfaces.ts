export interface iUser {
    _id: string,
    name: string,
    messages: number,
    commands: number,
    osu: { id: string, accessToken: string, tokenType: string, refreshToken: string, expires: Date, scopes: string, name: number }
}