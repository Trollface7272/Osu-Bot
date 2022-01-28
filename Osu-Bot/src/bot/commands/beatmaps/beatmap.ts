import { ConvertBitModsToMods, formatTime, GetDifficultyEmote } from "@functions/utils";
import { Beatmaps } from "@osuapi/endpoints/beatmap";


export const FormatBeatmap = (beatmap: Beatmaps.Beatmap, mods: number) => {
    let description = `**Length:** ${beatmap.Length}${beatmap.DrainLength !== beatmap.Length ? (` (${beatmap.DrainLength} drain)`) : ""} **BPM:** ${beatmap.Bpm} **Mods:** ${ConvertBitModsToMods(mods)}\n`
    description += `**Download:** [map](https://osu.ppy.sh/d/${beatmap.SetId})([no vid](https://osu.ppy.sh/d/${beatmap.SetId}n)) osu://b/${beatmap.SetId}\n`
    description += `**${GetDifficultyEmote(beatmap.GamemodeNum, beatmap.Stars)}${beatmap.Version}**\n`
    description += `▸**Difficulty:** ${beatmap.Stars}★ ▸**Max Combo:** x${beatmap.MaxCombo}\n`
    description += `▸**AR:** ${beatmap.Difficulty.AR} ▸**OD:** ${beatmap.Difficulty.OD} ▸**HP:** ${beatmap.Difficulty.HP} ▸**CS:** ${beatmap.Difficulty.CS}\n`
    //description += `▸**PP:** `
    //description += `○ **${mapDiffs[0].Formatted.AccPerc}%-**${mapDiffs[0].Formatted.Total}`
    //description += `○ **${mapDiffs[1].Formatted.AccPerc}%-**${mapDiffs[1].Formatted.Total}`
    //description += `○ **${mapDiffs[2].Formatted.AccPerc}%-**${mapDiffs[2].Formatted.Total}`
}

export const FormatBeatmapSet = (beatmapSet: Beatmaps.BeatmapSet) => {
    const length = beatmapSet.Beatmaps[0].Length
    const drain = beatmapSet.Beatmaps[0].DrainLength
    beatmapSet.Beatmaps.sort((v1, v2) => v1.Stars - v2.Stars)
    let description = `**[${beatmapSet.Artist} - ${beatmapSet.Title}](${`https://osu.ppy.sh/s/${beatmapSet.Id}`})** by **[${beatmapSet.Mapper}](https://osu.ppy.sh/u/${beatmapSet.MapperId})**\n`
    description += `**Length:** ${Math.floor(length / 60)}:${formatTime(length % 60)}${drain !== length ? (` (${Math.floor(drain / 60)}:${formatTime(drain % 60)} drain)`) : ""} **BPM:** ${beatmapSet.Bpm}\n`
    description += `**Download:** [map](https://osu.ppy.sh/d/${beatmapSet.Id})([no vid](https://osu.ppy.sh/d/${beatmapSet.Id}n)) osu://b/${beatmapSet.Id}\n`
    description += `${beatmapSet.Beatmaps.map(beatmap => `${GetDifficultyEmote(beatmap.GamemodeNum, beatmap.Stars)}\`${beatmap.Version}\` [${beatmap.Stars}\\*]`).join("\n")}\n`

    return description
}