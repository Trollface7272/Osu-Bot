import { GetUser } from "@database/users"

export interface parsedArgs {
    Name?: string[]
}

export const ParseArgs = (args: string[]): parsedArgs => {
    let out = {Name:[]}
    for (let i = 0; i < args.length; i++) {
        const el = args[i];
        out.Name.push(el)
    }
    return out
}

export const GetOsuToken = async (discordId: string, discordName: string) => {
    const data = await GetUser(discordId, discordName)
    if (!data.osu.token) return //TODO: Handle no user set
    if (data.osu.expireDate.getTime() - Date.now() < 0) return //TODO: Refresh token
    return data.osu.token
}