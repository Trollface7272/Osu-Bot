import { GradeEmotes } from "@consts/osu"
import { HandlePromise, ParseArgs, parsedArgs, HandleError, FindMapInConversation, GetFlagUrl, LeaderboardsFcPp } from "@functions/utils"
import { Beatmaps } from "@osuapi/endpoints/beatmap"
import { Score } from "@osuapi/endpoints/score"
import { OsuApi } from "@osuapi/index"
import { CommandInteraction, Message, MessageEmbed, MessageOptions } from "discord.js"

const formatLbScore = async (score: Score.Leaderboards, beatmap: Beatmaps.FromId, i: number, isAuthor: boolean) => {
    const [calculated, err] = await HandlePromise<any>(LeaderboardsFcPp(score, beatmap))
    const fcPP = ((calculated.performance.total < score.Pp) ? score.Pp : calculated.performance.total) as number
    let res = `**${i+1}.** ${isAuthor ? "__" : ""}**[${score.User.Username}](${score.User.ProfileUrl})**${isAuthor ? "__" : ""} **${score.Pp.roundFixed(2)}pp**/${fcPP.roundFixed(2)}pp **+${score.Mods.length == 0 ? "Nomod" : score.Mods.join("")}**\n`
    res += `${GradeEmotes[score.Rank]} ${score.Score.toLocaleString()} **${score.MaxCombo}x**/${beatmap.MaxCombo}x ${score.CreatedAt.toDiscordToolTip()}`
    return res
}

const leaderboards = async (id: string, {Map}: parsedArgs): Promise<MessageOptions> => {
    const [map, er] = await HandlePromise<Beatmaps.FromId>(OsuApi.Beatmap.ById({ id: parseInt(Map), OAuthId: id}))
    if (er) return HandleError(er)

    const [lb, err] = await HandlePromise<Score.BeatmapScores>(OsuApi.Score.Leaderboards({ id: parseInt(Map), country: true, OAuthId: id}))
    if (err) return HandleError(err)
    

    const scores = lb.Scores.slice(0, 10)
    const formated = (await Promise.all(scores.map((score, i) => formatLbScore(score, map, i, lb.UserScore.position === i+1)))).join("\n")
    const embed = new MessageEmbed()
        .setAuthor(`Top 10 ${lb.Scores[0].User.CountryCode} scores on ${map.BeatmapSet.Title} [${map.Version}]`, GetFlagUrl(lb.Scores[0].User.CountryCode), map.Url)
        .setDescription(formated)
    return {
        embeds: [embed]
    }
}


const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args, message.content.toLocaleLowerCase().split(" ")[0])

    if (params.Name) params.Map = params.Name
    else params.Map = await FindMapInConversation(message.channel)
    if (!params.Map || params.Map === "Not Found") return message.reply("**No maps found in conversation**")
    

    const data = await leaderboards(message.author.id, params)
    

    message.reply(data)
}

const interactionCallback = (interaction: CommandInteraction) => {

}

const name = ["clb", "countrylb", "countryleaderboards", "countrylb"]
export const messageCommand = {
    name,
    callback: messageCallback
}

export const interactionCommand = {
    name: "country leaderboards",
    callback: interactionCallback
}