import { ConvertBitModsToMods, FindMapInConversation, formatTime, GetDifficultyEmote, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils";
import { OsuApi } from "@osuapi/index";
import { Beatmaps } from "@osuapi/endpoints/beatmap";
import { GuildMember, Interaction, Message, MessageAttachment, MessageEmbed, MessageOptions } from "discord.js";
import { ErrorHandles } from "@functions/errors";
import { BeatmapFailTimes } from "@functions/canvasUtils";


export const FormatBeatmap = (beatmap: Beatmaps.Beatmap, mods: number) => {
    let description = `**Length:** ${Math.floor(beatmap.Length / 60)}:${formatTime(beatmap.Length % 60)}${beatmap.DrainLength !== beatmap.Length ? (` (${Math.floor(beatmap.DrainLength / 60)}:${formatTime(beatmap.DrainLength % 60)} drain)`) : ""} **BPM:** ${beatmap.Bpm} **Mods:** ${ConvertBitModsToMods(mods)}\n`
    description += `**Download:** [map](https://osu.ppy.sh/d/${beatmap.SetId})([no vid](https://osu.ppy.sh/d/${beatmap.SetId}n)) osu://b/${beatmap.SetId}\n`
    description += `**${GetDifficultyEmote(beatmap.GamemodeNum, beatmap.Stars)}${beatmap.Version}**\n`
    description += `▸**Difficulty:** ${beatmap.Stars}★ ▸**Max Combo:** x${beatmap.MaxCombo}\n`
    description += `▸**AR:** ${beatmap.Difficulty.AR.toFixed(1)} ▸**OD:** ${beatmap.Difficulty.OD.toFixed(1)} ▸**HP:** ${beatmap.Difficulty.HP.toFixed(1)} ▸**CS:** ${beatmap.Difficulty.CS.toFixed(1)}\n`
    //description += `▸**PP:** `
    //description += `○ **${mapDiffs[0].Formatted.AccPerc}%-**${mapDiffs[0].Formatted.Total}`
    //description += `○ **${mapDiffs[1].Formatted.AccPerc}%-**${mapDiffs[1].Formatted.Total}`
    //description += `○ **${mapDiffs[2].Formatted.AccPerc}%-**${mapDiffs[2].Formatted.Total}`
    return description
}

const Map = async (member: GuildMember, options: parsedArgs): Promise<MessageOptions> => {
    const [beatmap, err] = await HandlePromise<Beatmaps.Beatmap>(OsuApi.Beatmap.ById({ id: options.Map, OAuthId: member.user.id }))
    if (err) {
        if (err.error && ErrorHandles[err.error]) return ErrorHandles[err.error](err)
        return ErrorHandles.Unknown(err)
    }
    let description = FormatBeatmap(beatmap, options.Mods)

    const failTimes = new MessageAttachment(await BeatmapFailTimes(beatmap.FailTimes.fail, []), "failtimes.jpg")
    const embed = new MessageEmbed()
        .setAuthor(`${beatmap.BeatmapSet.Artist} - ${beatmap.BeatmapSet.Title} by ${beatmap.BeatmapSet.Mapper}`, ``, beatmap.Url)
        .setThumbnail(beatmap.Url)
        .setDescription(description)
        .setFooter(`${beatmap.BeatmapSet.Status} | ${beatmap.BeatmapSet.FavouritedCount} ❤︎ ${beatmap.BeatmapSet.Ranked > 0 ? ("| Approved " + new Date(beatmap.BeatmapSet.RankedDate).toISOString().slice(0, 10).replaceAll("-", " ")) : ""}`)
        .setImage("attachment://failtimes.jpg")

    return { embeds: [embed], files: [failTimes], allowedMentions: { repliedUser: false } }
}


const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args, message.content.toLocaleLowerCase().split(" ")[0])
    if (params.Name.length > 0) params.Map = params.Name[0]
    else params.Map = await FindMapInConversation(message.channel)
    const msg = await Map(message.member, params)
    message.reply(msg).catch(err => null)
}

const interactionCallback = (interaction: Interaction) => {

}




const name = ["map", "beatmap", "m"]
export const messageCommand = {
    name,
    callback: messageCallback
}

export const interactionCommand = {
    name: "osu profile",
    callback: interactionCallback
}