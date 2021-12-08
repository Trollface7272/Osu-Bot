import { GetUser, RefreshToken } from "@database/users"
import { iUser } from "@interfaces/database";
import { OsuApi } from "@osuapi/index"
import { ErrorCodes } from "./errors";
import logger from "./logger";

export interface parsedArgs {
    Name?: string[],
    Gamemode?: 0|1|2|3
}

export const ParseArgs = (args: string[]): parsedArgs => {
    let out: parsedArgs = {Name:[], Gamemode:0}
    for (let i = 0; i < args.length; i++) {
        const el = args[i];
        if (el == "m") {
            const mode = parseInt(args[i+1])
            if (mode >= 0 && mode <=3) {
                out.Gamemode = mode as 0|1|2|3
                i++
            }
        }
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

export const GetOsuProfile = async (userId: string, Name: string[], Mode: 0|1|2|3) => {
    let user: iUser|void = await GetUser(userId)
    
    const profileOptions = {id: Name[0], mode: Mode, self: false, token: undefined}
    if (Name?.length == 0)
        if (user?.osu?.token) {
            profileOptions.self = true
            profileOptions.token = `Bearer ${user.osu.token}`
        }
    
    if (!profileOptions.self && Name?.length == 0) throw { error: ErrorCodes.ProfileNotLinked }
    if (profileOptions.token && user.osu.expireDate.getTime() < Date.now()) user = await RefreshToken(user._id)
    if (!user) throw { error: ErrorCodes.ProfileNotLinked }
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