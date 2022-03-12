import { InteractionCache } from "@api/cache/Interactions"
import { CalculateAcc, CalculateProgress, GetHits, GetOsuProfile, HandleError, HandlePromise, ParseArgs, parsedArgs, RecentPp } from "@functions/utils"
import { OsuApi } from "@osuapi/index"
import { Utils } from "@osuapi/functions"
import { ButtonInteraction, CommandInteraction, Message, MessageEmbed, MessageOptions } from "discord.js"
import { Score } from "@osuapi/endpoints/score"
import { GetUser } from "@database/users"
import { ExtendedMessage } from "@bot/extends/ExtendedMessage"
import { GradeEmotes } from "@consts/osu"
import { Beatmaps } from "@osuapi/endpoints/beatmap"

const recent = async (id: string, args: parsedArgs): Promise<MessageOptions> => {
    if (args.Count) return count(id, args)

    return singleScore(id, args)
}

const singleScore = async (id: string, {Name, Gamemode}: parsedArgs): Promise<MessageOptions> => {
    let osuId = await Utils.lookupName(Name ?? (await GetUser(id)).osu.id as any, id)

    const offset = 0

    const [scores, err] = await HandlePromise<Score.Recent[]>(OsuApi.Score.GetRecent({OAuthId: id, id: osuId, mode: Gamemode, fails: true }))
    if (err) return HandleError(err)
    const score = scores[0]
    const [beatmap, err2] = await HandlePromise<Beatmaps.FromId>(OsuApi.Beatmap.ById({id: score.Beatmap.Id, OAuthId: id}))
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
    desc += `▸ ${score.Score} ▸ x${score.MaxCombo}/${beatmap.MaxCombo} ▸ [${GetHits(score.Counts, Gamemode)}]`

    if (score.Rank == "F")
        desc += `\n▸ **Map Completion:** ${CalculateProgress(score.Counts, beatmap.Counts, Gamemode)}%`

    const embed = new MessageEmbed()
        .setAuthor({name: `${beatmapSet.Title} [${beatmap.Version}] +${score.Mods.join(" ")} [${beatmap.StarRating}★]`, iconURL: `https://a.ppy.sh/${osuId}`, url: beatmap.Url})
        .setThumbnail(beatmapSet.Covers["list@2x"])
        .setDescription(desc)
        .setFooter({text: `Try #${tries} | ${score.CreatedAt.toDiscordToolTip()}`})
    
    return {embeds: [embed]}
}

const count = async (id: string, {Name, Gamemode}: parsedArgs): Promise<MessageOptions> => {
    let osuId = await Utils.lookupName(Name ?? (await GetUser(id)).osu.id as any, id)

    const [scores, err] = await HandlePromise<Score.Recent[]>(OsuApi.Score.GetRecent({OAuthId: id, id: osuId, mode: Gamemode, fails: true }))
    if (err) return HandleError(err)

    return {content: `Total: ${scores.length}\nPasses: ${scores.filter(el => el.Rank !== "F").length}`}
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