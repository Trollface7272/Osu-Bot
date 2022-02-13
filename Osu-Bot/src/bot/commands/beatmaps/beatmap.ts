import { ConvertBitModsToModsString, FindMapInConversation, formatTime, GetDifficultyEmote, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils";
import { OsuApi } from "@osuapi/index";
import { Beatmaps } from "@osuapi/endpoints/beatmap";
import { GuildMember, Interaction, Message, MessageActionRow, MessageAttachment, MessageEmbed, MessageOptions, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import { ErrorHandles } from "@functions/errors";
import { BeatmapFailTimes } from "@functions/canvasUtils";
import { CalculatorMultipleOut, Mods } from "@osuapi/calculator/base";
import { ApiCalculator } from "@osuapi/calculator/calculator";


export const FormatBeatmap = (beatmap: Beatmaps.FromId, mods: number, calculated: CalculatorMultipleOut) => {
    let description = `**Length:** ${Math.floor(beatmap.Length.total / 60)}:${formatTime(beatmap.Length.total % 60)}${beatmap.Length.drain !== beatmap.Length.total ? (` (${Math.floor(beatmap.Length.drain / 60)}:${formatTime(beatmap.Length.drain % 60)} drain)`) : ""} **BPM:** ${(mods & Mods.Bit.DoubleTime ? beatmap.Bpm * 1.5 : mods & Mods.Bit.HalfTime ? beatmap.Bpm * 0.75: beatmap.Bpm).roundFixed(0)} **Mods:** ${ConvertBitModsToModsString(mods)}\n`
    description += `**Download:** [map](https://osu.ppy.sh/d/${beatmap.SetId})([no vid](https://osu.ppy.sh/d/${beatmap.SetId}n)) [Direct](http://osu.epictrolled.shop/redirect?site=osu://b/${beatmap.Id})\n`
    description += `**${GetDifficultyEmote(beatmap.ModeNum, beatmap.StarRating)}${beatmap.Version}**\n`
    description += `▸**Difficulty:** ${beatmap.StarRating}★ ▸**Max Combo:** x${beatmap.MaxCombo}\n`
    description += `▸**AR:** ${calculated.difficulty.AR.toFixed(1)} ▸**OD:** ${calculated.difficulty.OD.toFixed(1)} ▸**HP:** ${calculated.difficulty.HP.toFixed(1)} ▸**CS:** ${calculated.difficulty.CS.toFixed(1)}\n`
    description += `▸**PP:** `
    for (let c of calculated.calculated)
        description += `○ **${c.acc.toFixed(2)}%-**${c.performance.total.roundFixed(2)}`

    return description
}

const Map = async (member: GuildMember, options: parsedArgs): Promise<MessageOptions> => {
    const [beatmap, err] = await HandlePromise<Beatmaps.FromId>(OsuApi.Beatmap.ById({ id: options.Map, OAuthId: member.user.id }))
    if (err) {
        if (err.error && ErrorHandles[err.error]) return ErrorHandles[err.error](err)
        return ErrorHandles.Unknown(err)
    }
    let description = FormatBeatmap(beatmap, options.Mods, await ApiCalculator.Calculators[options.Gamemode].CalculateMultipleAccs(beatmap, {Combo: beatmap.MaxCombo, Mods: options.Mods, Accuracy: [95, 98, 99, 100]}))

    const modsComponent = new MessageActionRow()
        .addComponents(new MessageSelectMenu()
            .setMinValues(0)
            .setMaxValues(6)
            .addOptions([{
                default: (options.Mods & 1) > 0,
                label: "NoFail",
                value: "1",
                emoji: "<:NoFail:586217719632887808>"
            }, {
                default: (options.Mods & 2) > 0,
                label: "Easy",
                value: "2",
                emoji: "<:Easy:586217683188580377>"
            }, {
                default: (options.Mods & 8) > 0,
                label: "Hidden",
                value: "8",
                emoji: "<:Hidden:586217719129440256>"
            }, {
                default: (options.Mods & 16) > 0,
                label: "Hard Rock",
                value: "16",
                emoji: "<:HardRock:586217719125245952>"
            }, {
                default: (options.Mods & 64) > 0,
                label: "Double Time",
                value: "64",
                emoji: "<:DoubleTime:586217676276367361>"
            }, {
                default: (options.Mods & 256) > 0,
                label: "Half Time",
                value: "256",
                emoji: "<:HalfTime:586217719104405504>"
            }, {
                default: (options.Mods & 1024) > 0,
                label: "Flashlight",
                value: "1024",
                emoji: "<:Flashlight:586217710371733536>"
            }, {
                default: (options.Mods & 4096) > 0,
                label: "Spun Out",
                value: "4096",
                emoji: "<:SpunOut:586217719318315030>"
            }])
            .setCustomId(``)
        )
    const failTimes = new MessageAttachment(await BeatmapFailTimes(beatmap.Failtimes.fail, []), "failtimes.jpg")
    const embed = new MessageEmbed()
        .setAuthor(`${beatmap.BeatmapSet.Artist} - ${beatmap.BeatmapSet.Title} by ${beatmap.BeatmapSet.Mapper}`, ``, beatmap.Url)
        .setThumbnail(beatmap.Url)
        .setDescription(description)
        .setFooter(`${beatmap.BeatmapSet.Status} | ${beatmap.BeatmapSet.Favourites} ❤︎ ${beatmap.BeatmapSet.Ranked > 0 ? ("| Approved " + new Date(beatmap.BeatmapSet.RankedDate).toISOString().slice(0, 10).replaceAll("-", " ")) : ""}`)
        .setImage("attachment://failtimes.jpg")

    return { embeds: [embed], files: [failTimes], components: [], allowedMentions: { repliedUser: false } }
}


const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args, message.content.toLocaleLowerCase().split(" ")[0])
    if (params.Name) params.Map = params.Name
    else params.Map = await FindMapInConversation(message.channel)
    if (!params.Map || params.Map === "Not Found") return message.reply("**No maps found in conversation**")
    const msg = await Map(message.member, params)
    message.reply(msg).catch(err => null)
}

const selectMenuInteraction = (interaction: SelectMenuInteraction) => {
    
}

const interactionCallback = (interaction: Interaction) => {
    if (interaction.isSelectMenu()) selectMenuInteraction(interaction as SelectMenuInteraction)
}




const name = ["map", "beatmap", "m"]
export const messageCommand = {
    name,
    callback: messageCallback
}

export const interactionCommand = {
    name: "osu map",
    callback: interactionCallback
}