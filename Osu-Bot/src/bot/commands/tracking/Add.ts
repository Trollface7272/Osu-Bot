import { TrackUser as TrackUserDb } from "@database/track"
import { ErrorHandles } from "@functions/errors"
import { GetOsuProfile, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { Profile } from "@osuapi/endpoints/profile"
import { Message, PermissionString } from "discord.js"


const TrackUser = async (userId: string, channelId: string, { Name, Gamemode, Specific }: parsedArgs) => {
    const [profile, err] = await HandlePromise<Profile.Profile>(GetOsuProfile(userId, Name, Gamemode))
    if (err) {
        if (err.error && ErrorHandles[err.error]) return ErrorHandles[err.error](err) 
        return ErrorHandles.Unknown(err)
    }

    if (!Specific[0] || Specific[0] > 100 || Specific[0] < 1) Specific[0] = 100

    const [res, err2] = await HandlePromise(TrackUserDb(profile.id, profile.Username, channelId, Gamemode, Specific[0], profile.Performance))
    if (!err2) return "👍"
    else return "👎"
}


const messageCallback = async (message: Message, args: string[]) => {
    switch (args[0]) {
        case "add":
            const options = ParseArgs(args.slice(1), message.content.toLocaleLowerCase().split(" ")[0])
            const msg = await TrackUser(message.author.id, message.channel.id, options)
            if (msg == "👍" || msg == "👎") return message.react(msg)
            else return message.reply(msg)
    }
}


const name = ["track", "tracking"]
const permissions: PermissionString[] = ["MANAGE_CHANNELS"]
export const messageCommand = {
    name,
    permissions,
    callback: messageCallback
}