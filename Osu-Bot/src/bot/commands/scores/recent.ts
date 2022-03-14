import { InteractionCache } from "@api/cache/Interactions"
import { CalculateAcc, CalculateProgress, DateDiff, GetCombo, GetFlagUrl, GetHits, GetProfileLink, HandleError, HandlePromise, ParseArgs, parsedArgs, RecentPp } from "@functions/utils"
import { OsuApi } from "@osuapi/index"
import { Utils } from "@osuapi/functions"
import { ButtonInteraction, CommandInteraction, MessageEmbed, MessageOptions, Util } from "discord.js"
import { Score } from "@osuapi/endpoints/score"
import { GetUser } from "@database/users"
import { ExtendedMessage } from "@bot/extends/ExtendedMessage"
import { GradeEmotes } from "@consts/osu"
import { Beatmaps } from "@osuapi/endpoints/beatmap"
import { CalculatorOut } from "@osuapi/calculator/base"

const formatMultipleScore = (score: Score.Recent, [normal, fc]: [CalculatorOut, CalculatorOut]) => {
    let desc = `**${score.Index}. [${Util.escapeMarkdown(score.BeatmapSet.Title)}[${Util.escapeMarkdown(score.Beatmap.Version)}]](${score.Beatmap.Url}) +${score.Mods.join("")}** [${normal.difficulty.Star.roundFixed(2)}★]\n`
    desc += `▸ ${GradeEmotes[score.Rank]} ▸ **${normal.performance.total}pp**/${fc.performance.total} ▸ ${score.Accuracy.roundFixed(2)}%\n`
    desc += `▸ ${score.Score.toLocaleString()} ▸ ${GetCombo(score.MaxCombo, score.Beatmap.MaxCombo, score.ModeInt)} ▸ ${GetHits(score.Counts, score.ModeInt)}\n`
    desc += `▸ Score Set ${score.CreatedAt.toDiscordToolTip()}`
    if (score.Rank === "F") desc += `\n**▸ Map Completion:** ${CalculateProgress(score.Counts, score.Beatmap.Counts, score.ModeInt)}`
    return desc
}

const recent = async (id: string, args: parsedArgs): Promise<MessageOptions> => {
    if (args.Count) return count(id, args)
    if (args.List) return listScore(id, args)
    return singleScore(id, args)
}

const singleScore = async (id: string, { Name, Gamemode, Specific }: parsedArgs): Promise<MessageOptions> => {
    let osuId = await Utils.lookupName(Name ?? (await GetUser(id)).osu.id as any, id)

    const offset = Specific[0] || 0
    console.log(Specific);


    const [scores, err] = await HandlePromise<Score.Recent[]>(OsuApi.Score.GetRecent({ OAuthId: id, id: osuId, mode: Gamemode, fails: true }))
    if (err) return HandleError(err)

    const score = scores[offset]
    const [beatmap, err2] = await HandlePromise<Beatmaps.FromId>(OsuApi.Beatmap.ById({ id: score.Beatmap.Id, OAuthId: id }))
    if (err2) return HandleError(err2)
    const beatmapSet = score.BeatmapSet
    score.SetCombo(beatmap.MaxCombo)
    const [recent, fc] = await RecentPp(score)


    let tries = 0
    for (let i = offset; i < scores.length; i++) {
        if (scores[i].Beatmap.Id === beatmap.Id) tries++
        else break
    }

    let desc = `▸ ${GradeEmotes[score.Rank]} ▸ **${recent.performance.total.roundFixed(2)}pp**/${fc.performance.total.roundFixed(2)}pp ▸ ${CalculateAcc(score.Counts, Gamemode)}%\n`
    desc += `▸ ${score.Score.toLocaleString()} ▸ x${score.MaxCombo}/${beatmap.MaxCombo} ▸ [${GetHits(score.Counts, Gamemode)}]`

    if (score.Rank == "F")
        desc += `\n▸ **Map Completion:** ${CalculateProgress(score.Counts, beatmap.Counts, Gamemode)}%`

    const embed = new MessageEmbed()
        .setAuthor({ name: `${beatmapSet.Title} [${beatmap.Version}] +${score.Mods.join("")} [${beatmap.StarRating.toFixed(2)}★]`, iconURL: `https://a.ppy.sh/${osuId}`, url: beatmap.Url })
        .setThumbnail(beatmapSet.Covers["list@2x"])
        .setDescription(desc)
        .setFooter({ text: `Try #${tries} | ${DateDiff(score.CreatedAt, new Date())} ago` })

    return { embeds: [embed] }
}

const listScore = async (id: string, { Name, Gamemode, Specific }: parsedArgs): Promise<MessageOptions> => {
    let osuId = await Utils.lookupName(Name ?? (await GetUser(id)).osu.id as any, id)

    let scoreIdx = Specific?.length > 0 ? Specific : [0, 1, 2, 3, 4]
    if (scoreIdx.length > 5) scoreIdx = scoreIdx.slice(0, 5)

    const [allScores, err] = await HandlePromise<Score.Recent[]>(OsuApi.Score.GetRecent({ OAuthId: id, id: osuId, mode: Gamemode, fails: true }))
    if (err) return HandleError(err)
    let scores: Score.Recent[] = scoreIdx.map(e => allScores[e])
    
    let beatmapsToGet: number[] = scores.map(e => e.Beatmap.Id)
    beatmapsToGet = beatmapsToGet.filter((el, i) => beatmapsToGet.indexOf(el) === i)
    
    const maps = await Promise.all(beatmapsToGet.map(map => OsuApi.Beatmap.ById({id: map, OAuthId: id})))
    scores.forEach(score => score.SetCombo(maps.find(e => e.Id == score.Beatmap.Id)?.MaxCombo || 0))
    
    

    const desc = (await Promise.all(scores.map(async score => {
        const data = (await RecentPp(score)) as [CalculatorOut, CalculatorOut]
        return formatMultipleScore(score, data)
    }))).join("\n")

    const embed = new MessageEmbed()
        .setDescription(desc)
        .setAuthor({ name: `Recent ${scoreIdx.length} plays for ${scores[0].User.Username}`, url: GetProfileLink(scores[0].UserId, scores[0].ModeInt), iconURL: GetFlagUrl(scores[0].User.CountryCode) })

    return { embeds: [embed] }
}

const count = async (id: string, { Name, Gamemode }: parsedArgs): Promise<MessageOptions> => {
    let osuId = await Utils.lookupName(Name ?? (await GetUser(id)).osu.id as any, id)

    const [scores, err] = await HandlePromise<Score.Recent[]>(OsuApi.Score.GetRecent({ OAuthId: id, id: osuId, mode: Gamemode, fails: true }))
    if (err) return HandleError(err)

    return { content: `Total: ${scores.length}\nPasses: ${scores.filter(el => el.Rank !== "F").length}` }
}

const messageCallback = async (message: ExtendedMessage, args: string[]) => {
    const params = ParseArgs(args, message.content.toLocaleLowerCase().split(" ")[0])
    if (params.Self) params.Name = message.author.data.osu?.id?.toString()

    const data = await recent(message.author.id, params)


    await message.reply(data)
}

const buttonInteraction = async (interaction: ButtonInteraction) => {
    const [, offset, id] = interaction.customId.split(";")
    const d = InteractionCache.LookUp(id)

}

const interactionCallback = (interaction: CommandInteraction) => {
    if (interaction.isButton()) return buttonInteraction(interaction as ButtonInteraction)
}

const name = ["r", "rs", "recent"]
export const messageCommand = {
    name,
    callback: messageCallback
}

export const interactionCommand = {
    name: "recent",
    callback: interactionCallback
}

