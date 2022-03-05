import { GamemodeNames, GradeEmotes } from "@consts/osu"
import { ErrorHandles } from "@functions/errors"
import { TopFcPp, GetCombo, GetFlagUrl, GetHits, GetOsuProfile, GetOsuTopPlays, GetProfileLink, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { OsuApi } from "@osuapi/index"
import { Score } from "@osuapi/endpoints/score"
import { randomInt } from "crypto"
import { CommandInteraction, Message, MessageEmbed, MessageOptions } from "discord.js"
import { CalculatorOut } from "@osuapi/calculator/base"
import { Profile } from "@osuapi/endpoints/profile"
import { Beatmaps } from "@osuapi/endpoints/beatmap"


const FormatTopPlay = (Gamemode: 0 | 1 | 2 | 3, score: Score.Best, calculated: CalculatorOut): string => {
    //@ts-ignore
    const beatmap = score.Beatmap as Beatmaps.FromIds
    const beatmapSet = score.BeatmapSet

    let  description = ""
    description += `**[${score.Index}.](${beatmap.Url}) [${beatmapSet.Title} [${beatmap.Version}]](${score.ScoreUrl}) +${score.Mods.length > 0 ? score.Mods.join("") : "NoMod"}** [${Math.round(calculated.difficulty.Star * 100) / 100}★]\n`
    description += `▸ ${GradeEmotes[score.Rank]} ▸ **${score.Pp}pp**/${Math.round(calculated.performance.total * 1000) / 1000}pp ▸ ${Math.round(score.Accuracy * 10000) / 100}%\n`
    description += `▸ ${score.Score.toLocaleString()} ▸ ${GetCombo(score.MaxCombo, beatmap.MaxCombo, Gamemode)} ▸ [${GetHits(score.Counts, Gamemode)}]\n`
    description += `▸ Score Set ${score.CreatedAt.toDiscordToolTip()}\n`

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
    const [profile, err] = await HandlePromise<Profile.FromId>(GetOsuProfile(userId, Name, Gamemode))
    if (err) {
        if (err.error && ErrorHandles[err.error]) return ErrorHandles[err.error](err)
        return ErrorHandles.Unknown(err)
    }
    let id = profile.Id
    
    let [scores, err2] = await HandlePromise<Score.Best[]>(GetOsuTopPlays(userId, id, Gamemode, { offset, limit: limit }))
    if (err2) {
        if (err2.error && ErrorHandles[err2.error]) return ErrorHandles[err2.error](err2)
        return ErrorHandles.Unknown(err2)
    }

    if (GreaterThan) scores = scores.filter(e => Reversed ? (e.Pp < GreaterThan) : (e.Pp > GreaterThan))

    if (Best) scores.sort((a, b) => b.CreatedAt.getTime() - a.CreatedAt.getTime())

    if (Reversed) {
        scores = scores.reverse()
    }

    if (Specific?.length > 0) {
        const out: Score.Best[] = []
        const base = Specific[0]
        for (let i = 0; i < Specific.length; i++) {
            if (scores[Specific[i] - base]) out.push(scores[Specific[i] - base])
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
        scores.find(el => el.Beatmap.Id === map.Id).SetCombo(map.MaxCombo)
    })
    
    const outScores = scores.slice(0, Math.min(scores.length, 5))
    let desc = (await Promise.all(outScores.map(async score => {
        let [calculated, err] = await HandlePromise<any>(TopFcPp(score))
        if (err) return
        
        if (calculated.performance.total < score.Pp) calculated.performance.total = score.Pp
        return FormatTopPlay(Gamemode, score, calculated)
    }))).join("")
    /*for (let i = 0; i < Math.min(scores.length, 5); i++) {
        const score = scores[i]
        let calculated: CalculatorOut
        if (score.MaxCombo < score.MaxCombo - 15 || score.Counts.miss > 0) {
            let counts = score.Counts
            counts[300] += counts.miss
            counts.miss = 0
            calculated = await ApiCalculator.Calculators[Gamemode].Calculate(score.Beatmap, { Mods: score.Mods, Combo: score.Beatmap.MaxCombo, Counts: counts })
        } else {
            let counts = score.Counts
            counts[300] += counts[50] + counts[100]
            counts.miss = 0
            counts[50] = 0
            counts[100] = 0
            calculated = await ApiCalculator.Calculators[Gamemode].Calculate(score.Beatmap, { Mods: score.Mods, Combo: score.Beatmap.MaxCombo, Counts: counts })
        }
        if (calculated.performance.total < score.Performance) calculated.performance.total = score.Performance
        desc += FormatTopPlay(Gamemode, score, calculated)
    }*/


    const embed = new MessageEmbed()
        .setAuthor(`Top ${Math.min(scores.length, 5)} ${GamemodeNames[Gamemode]} Play${scores.length > 1 ? "s" : ""} for ${profile.Username}`, GetFlagUrl(profile.Country.code), GetProfileLink(profile.Id, Gamemode))
        .setDescription(desc)
        //.setFooter(GetServer())
        .setThumbnail(profile.AvatarUrl)
    return ({ embeds: [embed], components: undefined, allowedMentions: { repliedUser: false } })
}


const messageCallback = async (message: Message, args: string[]) => {
    const parsedArgs = ParseArgs(args, message.content.toLocaleLowerCase().split(" ")[0])

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