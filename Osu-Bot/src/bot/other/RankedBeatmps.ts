import Client from "@bot/client";
import { GetEvents, UpdateEvent } from "@database/events";
import logger from "@functions/logger";
import { formatTime, GetDifficultyEmote, HandlePromise } from "@functions/utils";
import { Beatmaps } from "@osuapi/endpoints/beatmap";
import { OsuApi } from "@osuapi/index";
import { MessageEmbed, TextChannel } from "discord.js";

const FormatBeatmapSet = (beatmapSet: Beatmaps.Sets.SearchSet) => {
    const length = beatmapSet.Beatmaps[0].Length.total
    const drain = beatmapSet.Beatmaps[0].Length.drain
    const maps = beatmapSet.Beatmaps.sort((v1, v2) => v1.StarRating - v2.StarRating)
    
    let description = `**[${beatmapSet.Artist} - ${beatmapSet.Title}](${`https://osu.ppy.sh/s/${beatmapSet.Id}`})** by **[${beatmapSet.Mapper}](https://osu.ppy.sh/u/${beatmapSet.MapperId})**\n`
    description += `**Length:** ${Math.floor(length / 60)}:${formatTime(length % 60)}${drain !== length ? (` (${Math.floor(drain / 60)}:${formatTime(drain % 60)} drain)`) : ""} **BPM:** ${beatmapSet.Bpm}\n`
    description += `**Download:** [map](https://osu.ppy.sh/d/${beatmapSet.Id})([no vid](https://osu.ppy.sh/d/${beatmapSet.Id}n)) [Direct](http://osu.epictrolled.shop/redirect?site=osu://b/${maps[0].Id})\n`
    description += `${maps.map(beatmap => `${GetDifficultyEmote(beatmap.ModeNum, beatmap.StarRating)}\`${beatmap.Version}\` [${beatmap.StarRating}\\*]`).join("\n")}\n`

    return description
}

export const CheckForNewMaps = async (client: Client) => {
    const [, err] = await HandlePromise(Promise.all([_CheckForNewMaps(client, "ranked"),
    _CheckForNewMaps(client, "qualified")]))
    if (err) console.error(err)
}
const _CheckForNewMaps = async (client: Client, type: string) => {
    const event = await GetEvents(type)
    if (!event?.RegisteredChannels) return logger.Error("RankedBeatmaps -> event is unexpected value ->", event)

    const channelData = await Promise.all(event.RegisteredChannels.map(async (data) => [client.channels.cache.get(data.id) || await client.channels.fetch(data.id), data.mode]))
    const lastCheckDate = new Date("2022-05-13T00:45:20+00:00")//new Date(event.LastChecked)

    const [search, err] = await HandlePromise<Beatmaps.Sets.Search>(OsuApi.Beatmap.Search({ mode: 0, type: type }))
    if (err) return console.error(err)
    const beatmaps = search.BeatmapSets
    const maps = beatmaps?.filter((map: Beatmaps.Sets.SearchSet) =>
        map.RankedDate > lastCheckDate
    )

    if (maps?.length === 0) return

    let newest = lastCheckDate
    maps.map(map => { if (newest < map.RankedDate) newest = map.RankedDate })
    UpdateEvent(type, newest)

    const base = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle(`New ${type} map`)
    const data = maps.map((map) => ({
        embed: new MessageEmbed(base).setDescription(FormatBeatmapSet(map)).setThumbnail(`https://b.ppy.sh/thumb/${map.Id}l.jpg`),
        gamemodes: [...new Set(map.Beatmaps.map(e => e.ModeNum))]
    }))

    channelData.map(([channel, mode]: [TextChannel, (0 | 1 | 2 | 3)[]]) => {
        console.log("Sending");
        const embeds = data.map(e => mode.filter(value => e.gamemodes.includes(value)).length > 0 ? e.embed : null).filter(el => el !== null).slice(-10)
        if (embeds.length > 0) channel.send({ embeds })
    })
}