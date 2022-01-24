import Client from "@bot/client"
import { GetEvents, UpdateEvent } from "@database/events"
import logger from "@functions/logger"
import { HandlePromise } from "@functions/utils"
import { OsuNews, OsuNewsPost } from "@osuapi/endpoints/news"
import { OsuApi } from "@osuapi/index"
import { MessageEmbed, TextChannel } from "discord.js"

const FormatNewsPost = (embedBase: MessageEmbed, post: OsuNewsPost) => {
    let description = `[**${post.Title}**](https://osu.ppy.sh/home/news/${post.Slug})\n`
    description += `${post.Preview}\n`
    description += `Posted by ${post.Author}`

    const embed = new MessageEmbed(embedBase)
        .setThumbnail(post.FirstImage)
        .setDescription(description)
    return embed
}

export const CheckForOsuNews = async (client: Client) => {
    const event = await GetEvents("news")
    if (!event?.RegisteredChannels) return logger.Error("RankedBeatmaps -> event is unexpected value ->", event)

    const channels = await Promise.all(event.RegisteredChannels.map(async (data) => client.channels.cache.get(data.id) || await client.channels.fetch(data.id)))
    const lastCheckDate = new Date(event.LastChecked)

    const [data, err] = await HandlePromise<OsuNews>(OsuApi.News.GetNews({ silent: true }))

    const news = data.Posts.filter(val =>
        val.PublishedDate > lastCheckDate
    )

    if (news.length === 0) return
    
    let newest = lastCheckDate
    news.map(news => { if (newest < news.PublishedDate) newest = news.PublishedDate })
    UpdateEvent("news", newest)

    const base = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle(`New osu news post`)
    const embeds = news.map(post => FormatNewsPost(base, post))
    channels.map((channel: TextChannel) => {
        console.log("Sending");
        channel.send({ embeds: embeds.slice(-10) })
    })
}