import { GetUser } from "@database/users"
import { OsuApi } from "@osuapi/index"
import { ErrorCodes } from "./errors";

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

export const GetOsuProfile = async (userId: string, Name: string[]) => {
    const user = await GetUser(userId)
    
    const profileOptions = {id: Name[0], mode: 0 as const, self: false, token: undefined}
    if (user?.osu?.token) profileOptions.token = `Bearer ${user.osu.token}`
    if (Name?.length == 0)
        if (user?.osu?.token) {
            profileOptions.self = true
        }
    if (!profileOptions.self && Name?.length == 0) throw { error: ErrorCodes.ProfileNotLinked }
    const profile = await OsuApi.Profile.FromId(profileOptions)
    return profile
}

export const HandlePromise = async <T>(promise: Promise<any>): Promise<[T, any]> => {
    try {
        const res = await promise
        return [res, null]
    } catch (err) {
        return [null, err]
    }
}