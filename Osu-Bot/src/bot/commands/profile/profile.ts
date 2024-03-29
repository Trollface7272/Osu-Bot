import { ErrorCodes, ErrorHandles } from "@functions/errors"
import { calcBonusPp, formatScore, GetOsuProfile, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { Profile as _Profile } from "@osuapi/endpoints/profile"
import { GamemodeNames } from "@consts/osu"
import { GuildMember, Interaction, Message, MessageActionRow, MessageEmbed, MessageOptions, MessageSelectMenu, SelectMenuInteraction } from "discord.js"
import { Score } from "@osuapi/endpoints/score"
import { OsuApi } from "@osuapi/index"

const Profile = async (member: GuildMember, { Name, Gamemode }: parsedArgs): Promise<MessageOptions> => {
    const [profile, err] = await HandlePromise<_Profile.FromId>(GetOsuProfile(member.user.id, Name, Gamemode))
    if (err) {
        if (err.error == ErrorCodes.ProfileNotLinked) return ErrorHandles.ProfileNotLinked()
        return ErrorHandles.Unknown(err)
    }

    const [best, err2] = await HandlePromise<Score.Best[]>(OsuApi.Score.GetBest({ id: profile.Id, mode: Gamemode, limit: 100, offset: 0, OAuthId: member.user.id }))
    if (err2) {
        if (err2.error == ErrorCodes.ProfileNotLinked) return ErrorHandles.ProfileNotLinked()
        return ErrorHandles.Unknown(err2)
    }

    const bonuspp = Math.round(calcBonusPp(profile.Performance, profile.PlayCount, best) * 100) / 100
    const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setThumbnail(profile.AvatarUrl)
        .setAuthor(`${GamemodeNames[Gamemode]} Profile for ${profile.Username}`, profile.Country.flag, profile.ProfileUrl)
        .setDescription(
            `\
▸ **Rank:** #${profile.Rank.Global.toLocaleString()} (${profile.Country.code}#${profile.Rank.Country.toLocaleString()})
▸ **Level:** ${profile.Level.Current} (${profile.Level.Progress}%)
▸ **Performance:** ${profile.Performance.toLocaleString()}pp (${bonuspp} bonus)
▸ **Accuracy:** ${Math.round(profile.Accuracy * 100) / 100}%
▸ **Score:** ${formatScore(profile.Score.Ranked)} (${(formatScore(profile.Score.Total))})
▸ **Playcount:** ${profile.PlayCount.toLocaleString()} (${Math.round(profile.PlayTime / 60 / 60)} hours)\
`
        )
        .setImage("https://i.imgur.com/g1pszyN.png")

    const actionRow = new MessageActionRow().addComponents(
        new MessageSelectMenu()
            .setCustomId(`osu profile;${profile.Id}`)
            .setOptions([{
                default: Gamemode == 0,
                label: "Standard",
                value: "0",
                emoji: "<:Osu:909904224631001129>"
            }, {
                default: Gamemode == 1,
                label: "Taiko",
                value: "1",
                emoji: "<:Taiko:909904240858771476>"
            }, {
                default: Gamemode == 2,
                label: "Catch the beat",
                value: "2",
                emoji: "<:Fruits:909904199519703110>"
            }, {
                default: Gamemode == 3,
                label: "Mania",
                value: "3",
                emoji: "<:Mania:909904211800637450>"
            }])
    )
    return {
        embeds: [embed],
        components: [actionRow]
    }
}

const messageCallback = async (message: Message, args: string[]) => {
    if (process.env.NODE_ENV !== "development") return
    const osuArgs = ParseArgs(args, message.content.toLocaleLowerCase().split(" ")[0])
    const profile = await Profile(message.member, osuArgs)
    profile.allowedMentions = {
        repliedUser: false
    }
    message.reply(profile)
}

const selectMenuInteraction = async (interaction: SelectMenuInteraction) => {
    const profile = await Profile(interaction.member as GuildMember, { Name: interaction.customId.split(";")[1], Gamemode: parseInt(interaction.values[0]) as 0 | 1 | 2 | 3 })
    profile.allowedMentions = {
        repliedUser: false
    }
    interaction.update(profile)
}

const interactionCallback = async (interaction: Interaction) => {
    if (interaction.isSelectMenu()) selectMenuInteraction(interaction as SelectMenuInteraction)
}

const name = ["osu", "mania", "ctb", "fruits", "taiko"]
export const messageCommand = {
    name,
    callback: messageCallback
}

export const interactionCommand = {
    name: "osu profile",
    callback: interactionCallback
}