import { GamemodeNames, GradeEmotes } from "@consts/osu"
import { ErrorHandles } from "@functions/errors"
import logger from "@functions/logger"
import { DateDiff, GetCombo, GetFlagUrl, GetHits, GetOsuTopPlays, GetProfileLink, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { OsuApi } from "@osuapi/index"
import { Score } from "@osuapi/endpoints/score"
import { randomInt } from "crypto"
import { CommandInteraction, Message, MessageEmbed, MessageOptions } from "discord.js"


const FormatTopPlay = (Gamemode: 0 | 1 | 2 | 3, score: Score): string => {
    const beatmap = score.Beatmap
    const beatmapSet = score.BeatmapSet

    let fcppDisplay = "", description = ""
    //if (score.MaxCombo < score.MaxCombo - 15 || score.Counts.miss > 0) fcppDisplay = `(${score.FcPerformance.toLocaleString()}pp for ${RoundFixed(score.FcAccuracy)}% FC) `
    if (score.MaxCombo < beatmap.MaxCombo - 15 || score.Counts.miss > 0) fcppDisplay = `(${1}pp for ${1}% FC) `
    description += `**${score.Index}. [${beatmapSet.Title} [${beatmap.Version}]](${score.ScoreUrl}) +${score.Mods.length > 0 ? score.Mods : "NoMod"}** [${Math.round(beatmap.Stars * 100) / 100}★]\n`
    description += `▸ ${GradeEmotes[score.Grade]} ▸ **${score.Performance}pp** ${fcppDisplay}▸ ${Math.round(score.Accuracy * 10000) / 100}%\n`
    description += `▸ ${score.Score.toLocaleString()} ▸ ${GetCombo(score.MaxCombo, beatmap.MaxCombo, Gamemode)} ▸ [${GetHits(score.Counts, Gamemode)}]\n`
    description += `▸ Score Set ${DateDiff(score.SetAt, new Date(new Date().toLocaleString('en-US', { timeZone: "UTC" })))}Ago\n`

    return description
}

const osuTop = async (userId: string, { Name, Gamemode, GreaterThan, Best, Reversed, Specific, Random }: parsedArgs): Promise<MessageOptions> => {
    let offset = 0, limit = 6
    if (Specific.length > 0) {
        Specific.sort((a, b) => a - b)
        offset = Specific[0] - 1
        limit = Specific[Specific.length - 1] - offset
    }
    if (GreaterThan || Best) { offset = 0; limit = 100 }
    if (Reversed) offset = 100 - limit
    if (Random) {
        limit = 1
        offset = randomInt(100)
    }
    let [scores, err2] = await HandlePromise<Score[]>(GetOsuTopPlays(userId, Name, Gamemode, { offset, limit: limit }))
    if (err2) {
        if (err2.error && ErrorHandles[err2.error]) return ErrorHandles[err2.error](err2)
        return ErrorHandles.Unknown(err2)
    }
    const profile = scores[0].User

    if (GreaterThan) scores = scores.filter(e => Reversed ? (e.Performance < GreaterThan) : (e.Performance > GreaterThan))

    if (Best) scores.sort((a, b) => b.SetAt.getTime() - a.SetAt.getTime())

    if (Reversed) {
        scores = scores.reverse()
    }

    if (Specific?.length > 0) {
        const out: Score[] = []
        const base = Specific[0]
        for (let i = 0; i < Specific.length; i++) {
            if (scores[Specific[i]-base]) out.push(scores[Specific[i]-base])
        }
        scores = out
        if (out.length < 1) return ErrorHandles.Unknown(err2)
    }

    if (Random) scores = [scores[Math.floor(Math.random() * (scores.length - 1) + 1)]]

    const mapIds = []
    for (let i = 0; i < Math.min(scores.length, 5); i++) {
        mapIds.push(scores[i].Beatmap.Id)
    }
    const maps = await OsuApi.Beatmap.ByIds({ id: mapIds, mode: Gamemode })
    maps.map(map => {
        scores.find(el => el.Beatmap.Id === map.Id).Beatmap.MaxCombo = map.MaxCombo
    })
    let desc = ""
    
    for (let i = 0; i < Math.min(scores.length, 5); i++) {
        desc += FormatTopPlay(Gamemode, scores[i])
    }


    const embed = new MessageEmbed()
        .setAuthor(`Top ${Math.min(scores.length, 5)} ${GamemodeNames[Gamemode]} Play${scores.length > 1 ? "s" : ""} for ${profile.Username}`, GetFlagUrl(profile.Country.code), GetProfileLink(profile.id, Gamemode))
        .setDescription(desc)
        //.setFooter(GetServer())
        .setThumbnail(profile.Avatar)
    return ({ embeds: [embed], components: undefined, allowedMentions: { repliedUser: false } })
}


const messageCallback = async (message: Message, args: string[]) => {
    const parsedArgs = ParseArgs(args)

    const data = await osuTop(message.author.id, parsedArgs)

    message.reply(data)
}

const interactionCallback = (interaction: CommandInteraction) => {

}

const name = ["top", "osutop", "maniatop", "ctbtop", "fruitstop", "taikotop"]
export const messageCommand = {
    name,
    callback: messageCallback
}

export const interactionCommand = {
    name: "osu profile",
    callback: interactionCallback
}