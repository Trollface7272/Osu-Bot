import Client from "@bot/client";
import { GradeEmotes } from "@consts/osu";
import { GetTracked } from "@database/track";
import { ErrorHandles } from "@functions/errors";
import { DateDiff, GetCombo, GetHits, GetOsuTopPlays, HandlePromise } from "@functions/utils";
import { OsuApi } from "@osuapi/index";
import { Score } from "@osuapi/endpoints/score";
import { MessageEmbed, TextChannel } from "discord.js";
import { Profile } from "@osuapi/endpoints/profile";

let offset = 0

const formatTrackingScore = (base: MessageEmbed, score: Score.Score, pp: number) => {
    let fcppDisplay = "" 
    let description  = `**[${score.BeatmapSet.Title} [${score.Beatmap.Version}]](${score.ScoreUrl}) +${score.Mods.length > 0 ? score.Mods : "NoMod"}** [${Math.round(score.Beatmap.Stars * 100) / 100}★]\n`
        description += `▸ ${GradeEmotes[score.Grade]} ▸ **${score.Performance}**/${0}pp▸ ${Math.round(score.Accuracy * 10000) / 100}%\n`
        description += `▸ ${score.Score.toLocaleString()} ▸ ${GetCombo(score.MaxCombo, score.Beatmap.MaxCombo, score.Beatmap.GamemodeNum)} ▸ [${GetHits(score.Counts, score.Beatmap.GamemodeNum)}]\n`
        
    const embed = new MessageEmbed(base)
        .setAuthor(`${score.User.Username} gained a new #${score.Index} top play.`, score.User.Avatar, score.User.Url)
        .setFooter(`Set ${DateDiff(new Date(), score.SetAt)}Ago\n`)
        .setDescription(description)
        .setThumbnail(`https://b.ppy.sh/thumb/${score.Beatmap.Id}l.jpg`)
    return embed
}

export const RunTracking = async (client: Client) => {
    const tracked = await GetTracked(offset)
    if (!tracked || !tracked.channels) return
    
    if (tracked.isLast) offset = 0
    else offset++
    
    const channelData = await Promise.all(tracked.channels.map(async (data) => [client.channels.cache.get(data.channelId) || await client.channels.fetch(data.channelId), data.limit]))
    const lastCheckDate = tracked.lastCheck

    const [scores, err] = await HandlePromise<Score.Score[]>(GetOsuTopPlays(null, [tracked.id.toString()], tracked.mode, {offset: 0, limit: 100 }))
    if (err) {
        if (err.error && ErrorHandles[err.error]) return
        return ErrorHandles.Unknown(err)
    }

    const newScores = scores.filter(score => score.SetAt > lastCheckDate)

    if (newScores.length === 0) return

    const [profile, err2] = await HandlePromise<Profile.Profile>(OsuApi.Profile.FromId({ id: tracked.id.toString(), mode: tracked.mode }))
    if (err2) {
        if (err.error && ErrorHandles[err.error]) return
        return ErrorHandles.Unknown(err)
    }
    const maps = await OsuApi.Beatmap.ByIds({id: newScores.map(e => e.Beatmap.Id.toString()), mode: tracked.mode})

    const base = new MessageEmbed()
        .setColor("RANDOM")
    const embedData = newScores.map(score => {
        score.Beatmap.MaxCombo = maps.find(map => map.Id == score.Beatmap.Id).MaxCombo
        return [formatTrackingScore(base, score, profile.Performance - tracked.performance), score.Index]
    })

    channelData.map(([channel, limit]: [TextChannel, number]) => {
        const embeds = embedData.map(([embed, index]: [MessageEmbed, number]) => index <= limit ? embed: undefined).filter(e => e !== null)
        channel.send({ embeds: embeds.slice(-10) })
    })
}