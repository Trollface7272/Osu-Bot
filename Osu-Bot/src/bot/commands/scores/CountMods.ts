import { GamemodeNames } from "@consts/osu"
import {  GetOsuProfile, GetOsuTopPlays, HandleError, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { Profile } from "@osuapi/endpoints/profile"
import { Score } from "@osuapi/endpoints/score"
import { UsernameCache } from "@osuapi/../cache/Usernames"
import { CommandInteraction, GuildMember, Message, MessageEmbed, MessageOptions } from "discord.js"



const countMods = async (member: GuildMember, args: parsedArgs): Promise<MessageOptions> => {
    let username = args.Name?.isNumber() ? parseInt(args.Name) : UsernameCache.LookUp(args.Name)
    if (!username) {
        const [user, e] = await HandlePromise<Profile.FromId>(GetOsuProfile(member.user.id, args.Name, args.Gamemode))
        if (e) return HandleError(e)
        username = user.Id
        UsernameCache.Add(user.Username, user.Id)
    }
    const [scores, err] = await HandlePromise<Score.Best[]>(GetOsuTopPlays(member.user.id, username, args.Gamemode, { OAuthId: member.user.id }))
    if (err) return HandleError(err)
    
    const data: { mods: string, count: number, pp: number }[] = []
    scores.map(score => {
        let mods = score.Mods.join("")
        mods === "" ? mods = "Nomod" : mods
        const el = data.find(e => e.mods === mods)
        if (el) {
            el.count++
            el.pp += score.Weight.pp
        } else data.push({ mods: mods === "" ? "Nomod" : mods, count: 1, pp: score.Weight.pp })
    })
    data.sort((a, b) => b.count - a.count)
    let description = data.map(el => `**${el.mods}**: ${el.count} (${Math.round(el.pp * 100) / 100}pp)`).join("\n")
    const embed = new MessageEmbed()
        .setAuthor(`Mods in ${GamemodeNames[args.Gamemode]} Top Plays for ${scores[0].User.Username}`, scores[0].User.Flag, scores[0].User.ProfileUrl)
        .setDescription(description)
        .setThumbnail(scores[0].User.AvatarUrl)
    return { embeds: [embed], allowedMentions: { repliedUser: false } }
}




const messageCallback = async (message: Message, args: string[]) => {
    const parsedArgs = ParseArgs(args, message.content.toLocaleLowerCase().split(" ")[0])

    const data = await countMods(message.member, parsedArgs)

    message.reply(data)
}

const interactionCallback = (interaction: CommandInteraction) => {

}

const name = ["countmods", "cm"]
export const messageCommand = {
    name,
    callback: messageCallback
}

export const interactionCommand = {
    name: "osu profile",
    callback: interactionCallback
}