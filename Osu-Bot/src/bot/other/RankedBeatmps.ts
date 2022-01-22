import Client from "@bot/client";
import { FormatBeatmapSet } from "@bot/commands/beatmaps/beatmap";
import { GetEvents } from "@database/events";
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

    const channels = await Promise.all(event.RegisteredChannels.map(async id => client.channels.cache.get(id) || await client.channels.fetch(id)))
    const lastCheckDate = new Date(event.LastChecked)

    const [beatmaps, err] = await HandlePromise<BeatmapSet[]>(OsuApi.Beatmap.Search({ mode: 0, type: type, silent: true }))
    const maps = beatmaps.filter((map: BeatmapSet) =>
        map.RankedDate > lastCheckDate
    )

    if (maps.length === 0) return

    const data = maps.map((map) => { return { description: FormatBeatmapSet(map), image: `https://b.ppy.sh/thumb/${map.Id}l.jpg` } })
    const base = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle(`New ranked map`)
    const embeds = data.map((d: {description: string, image: string}) => new MessageEmbed(base).setDescription(d.description).setThumbnail(d.image))
    channels.map((channel: TextChannel) => {
        console.log("Sending");
        channel.send({ embeds: embeds.slice(-10) })
    })
}