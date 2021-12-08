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
        .setURL(profile.ProfileUrl)
        .setAuthor(`${GamemodeNames[Gamemode]} Profile for ${profile.Username}`)
        .setDescription(
`\
**Rank:** #${profile.Rank.Global} (#${profile.Rank.Country}${profile.Country.code})
**Level:** ${profile}
`
        )
    return {
        embeds: [embed]
    }
}

const messageCallback = async (message: Message, args: string[]) => {
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