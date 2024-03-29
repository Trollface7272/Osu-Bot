import Client from "@bot/client";
import { GradeEmotes } from "@consts/osu";
import { GetTracked, UpdateTracked } from "@database/track";
import { ErrorHandles } from "@functions/errors";
import { DateDiff, TopFcPp, GetCombo, GetHits, HandlePromise } from "@functions/utils";
import { OsuApi } from "@osuapi/index";
import { Score } from "@osuapi/endpoints/score";
import { MessageEmbed, TextChannel } from "discord.js";
import { Profile } from "@osuapi/endpoints/profile";
import { Beatmaps } from "@osuapi/endpoints/beatmap";
import { CalculatorOut } from "@osuapi/calculator/base";

let offset = 4

const formatTrackingScore = (base: MessageEmbed, score: Score.Best, pp: number|string, calculatod: CalculatorOut) => {
    const beatmap = score.Beatmap as Beatmaps.FromId
    let description = `**[${score.BeatmapSet.Title} [${score.Beatmap.Version}]](${score.ScoreUrl}) +${score.Mods.length > 0 ? score.Mods.join("") : "NoMod"}** [${Math.round(calculatod.difficulty.Star * 100) / 100}★]\n`
    description += `▸ ${GradeEmotes[score.Rank]} ▸ **${score.Pp}**/${Math.round(calculatod.performance.total * 1000) / 1000}pp▸ ${Math.round(score.Accuracy * 10000) / 100}% (${pp > 0 ? `+${pp}` : pp}pp)\n`
    description += `▸ ${score.Score.toLocaleString()} ▸ ${GetCombo(score.MaxCombo, beatmap.MaxCombo, score.Beatmap.ModeNum)} ▸ [${GetHits(score.Counts, score.Beatmap.ModeNum)}]\n`
    description += `▸ Score Set ${score.CreatedAt.toDiscordToolTip()}\n`
    const embed = new MessageEmbed(base)
        .setAuthor({name: `${score.User.Username} gained a new #${score.Index} top play.`, iconURL: score.User.AvatarUrl, url: score.User.ProfileUrl})
        .setDescription(description)
        .setThumbnail(`https://b.ppy.sh/thumb/${score.Beatmap.SetId}l.jpg`)
    return embed
}

export const RunTracking = async (client: Client) => {
    const tracked = await GetTracked(offset)
    const oldOffset = offset
    if (!tracked || !tracked.channels) return

    if (tracked.isLast) offset = 0
    else offset++

    const channelData = await Promise.all(tracked.channels.map(async (data) => [client.channels.cache.get(data.channelId) || await client.channels.fetch(data.channelId), data.limit]))
    const lastCheckDate = tracked.lastCheck

    const [profile, err2] = await HandlePromise<Profile.FromId>(OsuApi.Profile.FromId({ id: tracked.id, mode: tracked.mode }))
    if (err2) {
        if (err2.error && ErrorHandles[err2.error]) return
        return ErrorHandles.Unknown(err2)
    }

    if (profile.Performance == tracked.performance) return

    const [scores, err] = await HandlePromise<Score.Best[]>(OsuApi.Score.GetBest({ id: profile.Id, mode: tracked.mode, limit: 100, offset: 0 }))
    if (err) {
        if (err.error && ErrorHandles[err.error]) return
        return ErrorHandles.Unknown(err)
    }

    const newScores = scores.filter(score => score.CreatedAt > lastCheckDate)

    if (newScores.length === 0) return
    UpdateTracked(oldOffset, profile.Performance, new Date())

    const maps = await OsuApi.Beatmap.ByIds({ id: newScores.map(e => e.Beatmap.Id.toString()), mode: tracked.mode })

    const base = new MessageEmbed()
        .setColor("RANDOM")
    const embedData = await Promise.all(newScores.map(async score => {
        maps.map(map => {
            scores.find(el => el.Beatmap.Id === map.Id).SetCombo(map.MaxCombo)
        })
        const [calculated, err] = await HandlePromise<any>(TopFcPp(score))
        if (err) return
        return [formatTrackingScore(base, score, (profile.Performance - tracked.performance).roundFixed(3), calculated), score.Index]
    }))

    channelData.map(([channel, limit]: [TextChannel, number]) => {
        const embeds = embedData.filter(e => e != undefined).map(([embed, index]: [MessageEmbed, number]) => index <= limit ? embed : undefined).filter(e => e != null)
        channel.send({ embeds: embeds.slice(-10) })
    })
}