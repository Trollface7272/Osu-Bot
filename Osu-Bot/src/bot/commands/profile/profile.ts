import { ErrorCodes, ErrorHandles } from "@functions/errors"
import { GetOsuProfile, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { OsuProfile } from "@osuapi/endpoints/profile"
import { GamemodeNames } from "@consts/osu"
import { GuildMember, Message, MessageEmbed, MessageOptions } from "discord.js"

const Profile = async (member: GuildMember, {Name, Gamemode}: parsedArgs): Promise<MessageOptions> => {
    const [profile, err] = await HandlePromise<OsuProfile>(GetOsuProfile(member.user.id, Name, Gamemode))
    if (err) {
        if (err.error == ErrorCodes.ProfileNotLinked) return ErrorHandles.ProfileNotLinked()
        return ErrorHandles.Unknown(err)
    }
    const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setThumbnail(profile.Avatar)
        .setAuthor(`${GamemodeNames[Gamemode]} Profile for ${profile.Username}`, profile.Country.flag, profile.ProfileUrl)
        .setDescription(
`\
▸ **Rank:** #${profile.Rank.Global.toLocaleString()} (${profile.Country.code}#${profile.Rank.Country.toLocaleString()})
▸ **Level:** ${profile.Level.Current} (${profile.Level.Progress}%)
▸ **Performance:** ${profile.Performance.toLocaleString()}pp
▸ **Accuracy:** ${Math.round(profile.Accuracy * 100) / 100}%
▸ **Playcount:** ${profile.PlayCount} (${Math.round(profile.PlayTime/60/60)} hours)\
`
        )
    return {
        embeds: [embed]
    }
}

const messageCallback = async (message: Message, args: string[]) => {
    if (process.env.NODE_ENV !== "development") return
    const osuArgs = ParseArgs(args)
    const profile = await Profile(message.member, osuArgs)
    profile.allowedMentions = {
        repliedUser: false
    }
    message.reply(profile)
}

const name = ["osu", "mania", "ctb", "fruits", "taiko"]
export const messageCommand = {
    name,
    callback: messageCallback
}