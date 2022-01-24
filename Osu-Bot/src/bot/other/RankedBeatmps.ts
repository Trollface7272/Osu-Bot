import Client from "@bot/client";
import { FormatBeatmapSet } from "@bot/commands/beatmaps/beatmap";
import { GetEvents, UpdateEvent } from "@database/events";
import logger from "@functions/logger";
import { HandlePromise } from "@functions/utils";
import { BeatmapSet } from "@osuapi/endpoints/beatmap";
import { OsuApi } from "@osuapi/index";
import { MessageEmbed, TextChannel } from "discord.js";

export const CheckForNewMaps = async (client: Client) => {
    await Promise.all([_CheckForNewMaps(client, "ranked"),
    _CheckForNewMaps(client, "qualified")])
}
const _CheckForNewMaps = async (client: Client, type: string) => {
    const event = await GetEvents(type)
    if (!event?.RegisteredChannels) return logger.Error("RankedBeatmaps -> event is unexpected value ->", event)

    const channelData = await Promise.all(event.RegisteredChannels.map(async (data) => [client.channels.cache.get(data.id) || await client.channels.fetch(data.id), data.mode]))
    const lastCheckDate = new Date(event.LastChecked)

    const [beatmaps, err] = await HandlePromise<BeatmapSet[]>(OsuApi.Beatmap.Search({ mode: 0, type: type, silent: true }))
    const maps = beatmaps.filter((map: BeatmapSet) =>
        map.RankedDate > lastCheckDate
    )

    if (maps.length === 0) return

    let newest = lastCheckDate
    maps.map(map => { if (newest < map.RankedDate) newest = map.RankedDate })
    UpdateEvent(type, newest)

    const base = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle(`New ${type} map`)
    const data = maps.map((map) => ({
        embed: new MessageEmbed(base).setDescription(FormatBeatmapSet(map)).setThumbnail(`https://b.ppy.sh/thumb/${map.Id}l.jpg`),
        gamemodes: [...new Set(map.Beatmaps.map(e => e.GamemodeNum))]
    }))

    channelData.map(([channel, mode]: [TextChannel, (0 | 1 | 2 | 3)[]]) => {
        console.log("Sending");
        const embeds = data.map(e => mode.filter(value => e.gamemodes.includes(value)).length > 0 ? e.embed : null).filter(el => el !== null).slice(-10)
        if (embeds.length > 0) channel.send({ embeds })
    })
}