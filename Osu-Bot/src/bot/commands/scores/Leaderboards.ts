import { GradeEmotes } from "@consts/osu"
import { HandlePromise, ParseArgs, parsedArgs, HandleError, FindMapInConversation, GetFlagUrl } from "@functions/utils"
import { Beatmaps } from "@osuapi/endpoints/beatmap"
import { Score } from "@osuapi/endpoints/score"
import { OsuApi } from "@osuapi/index"
import { InteractionCache } from "@api/cache/Interactions"
import { randomBytes } from "crypto"
import { ButtonInteraction, CommandInteraction, Message, MessageActionRow, MessageButton, MessageEmbed, MessageOptions } from "discord.js"

const formatLbScore = async (score: Score.Leaderboards, beatmap: Beatmaps.FromId, i: number, isAuthor: boolean) => {
    let res = `**${i + 1}.** ${isAuthor ? "__" : ""}**[${score.User.Username}](${score.User.ProfileUrl})**${isAuthor ? "__" : ""} **${score.Pp.roundFixed(2)}pp** **${(score.Accuracy * 100).roundFixed(2)}%** **+${score.Mods.length == 0 ? "Nomod" : score.Mods.join("")}**\n`
    res += `▸ ${GradeEmotes[score.Rank]} ${score.Score.toLocaleString()} **${score.MaxCombo}x**/${beatmap.MaxCombo}x ${score.CreatedAt.toDiscordToolTip()}`
    return res
}

const newLaderboards = async (id: string, country: boolean, { Map, Specific }: parsedArgs): Promise<MessageOptions> => {
    const [map, er] = await HandlePromise<Beatmaps.FromId>(OsuApi.Beatmap.ById({ id: parseInt(Map), OAuthId: id }))
    if (er) return HandleError(er)

    const [lb, err] = await HandlePromise<Score.BeatmapScores>(OsuApi.Score.Leaderboards({ id: parseInt(Map), country: true, OAuthId: id }))
    if (err) return HandleError(err)

    let offset = Specific[0] * 10
    if (offset < 0 || offset > lb.Scores.length) offset = 0
    const intId = randomBytes(16).toString("hex")
    InteractionCache.Add(intId, { map, lb })
    
    

    return leaderboardsCache(lb, map, offset, intId)
}

const leaderboardsCache = async (lb: Score.BeatmapScores, map: Beatmaps.FromId, offset: number, intId: string): Promise<MessageOptions> => {
    if (!map.HasLeaderboards) return { embeds: [new MessageEmbed().setDescription(`Map doesn't have leaderboards`)] }
    if (lb.Scores.length === 0) return { embeds: [new MessageEmbed().setDescription(`No scores found`)] }
    
    const buttons = [newButton(intId, "⇇", 0, lb.Scores.length), newButton(intId, "←", offset - 10, lb.Scores.length),
                     newButton(intId, "→", offset+10, lb.Scores.length), newButton(intId, "⇉", Math.floor((lb.Scores.length-1) / 10) * 10, lb.Scores.length)]
    const row = new MessageActionRow().addComponents(buttons)

    const scores = lb.Scores.slice(offset, offset + 10)
    const formated = (await Promise.all(scores.map((score, i) => formatLbScore(score, map, offset+i, lb.UserScore?.position === i + 1)))).join("\n")
    const embed = new MessageEmbed()
        .setAuthor(`Top ${offset+1}-${Math.min(offset+10, lb.Scores.length)} ${lb.Scores[0].User.CountryCode} scores on ${map.BeatmapSet.Title} [${map.Version}]`, GetFlagUrl(lb.Scores[0].User.CountryCode), map.Url)
        .setDescription(formated)
        .setThumbnail(map.BeatmapSet.Covers["list@2x"])
    return {
        embeds: [embed], components: [row]
    }
}

const newButton = (id: string, label: string, offset: number, totalScores: number) => {
    offset = offset >= totalScores ? 0 : offset < 0 ? Math.floor((totalScores-1) / 10) * 10 : offset
    const button = new MessageButton()
        .setCustomId(`leaderboards;${offset};${id};${randomBytes(16).toString("hex")}`)
        .setLabel(label)
        .setStyle(1)
    return button
}


const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args, message.content.toLocaleLowerCase().split(" ")[0])

    if (params.Name) params.Map = params.Name
    else params.Map = await FindMapInConversation(message.channel)
    if (!params.Map || params.Map === "Not Found") return message.reply("**No maps found in conversation**")


    const data = await newLaderboards(message.author.id, true, params)


    message.reply(data)
}

const buttonInteraction = async (interaction: ButtonInteraction) => {
    const [, offset, id] = interaction.customId.split(";")
    const { lb, map } = InteractionCache.LookUp(id)

    interaction.update(await leaderboardsCache(lb, map, parseInt(offset), id))
}

const interactionCallback = (interaction: CommandInteraction) => {
    if (interaction.isButton()) return buttonInteraction(interaction as ButtonInteraction)
}

const name = ["clb", "countrylb", "countryleaderboards", "countrylb"]
export const messageCommand = {
    name,
    callback: messageCallback
}

export const interactionCommand = {
    name: "leaderboards",
    callback: interactionCallback
}