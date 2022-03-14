import { GradeEmotes } from "@consts/osu"
import { GetFlagUrl } from "@functions/utils"
import { Beatmaps } from "@osuapi/endpoints/beatmap"
import { Score } from "@osuapi/endpoints/score"
import { pseudoRandomBytes } from "crypto"
import { EmbedAuthorData, MessageActionRow, MessageButton, MessageEmbed, MessageOptions } from "discord.js"

const formatLbScore = async (score: Score.Leaderboards, beatmap: Beatmaps.FromId, i: number, isAuthor: boolean) => {
    let res = `**${i + 1}.** ${isAuthor ? "__" : ""}**[${score.User.Username}](${score.User.ProfileUrl})**${isAuthor ? "__" : ""} **${score.Pp?.roundFixed(2) || 0}pp** **${(score.Accuracy * 100).roundFixed(2)}%** **+${score.Mods.length == 0 ? "Nomod" : score.Mods.join("")}**\n`
    res += `▸ ${GradeEmotes[score.Rank]} ${score.Score.toLocaleString()} **${score.MaxCombo}x**/${beatmap.MaxCombo}x ${score.CreatedAt.toDiscordToolTip()}`
    return res
}

export const format = async (lb: Score.BeatmapScores, map: Beatmaps.FromId, offset: number, intId: string, global: boolean, author: EmbedAuthorData): Promise<MessageOptions> => {
    if (!map.HasLeaderboards) return { embeds: [new MessageEmbed().setDescription(`Map doesn't have leaderboards`)] }
    if (lb.Scores.length === 0) return { embeds: [new MessageEmbed().setDescription(`No scores found`)] }
    
    const buttons = [newButton(intId, "⇇", 0, lb.Scores.length, global), newButton(intId, "←", offset - 10, lb.Scores.length, global),
                     newButton(intId, "→", offset+10, lb.Scores.length, global), newButton(intId, "⇉", Math.floor((lb.Scores.length-1) / 10) * 10, lb.Scores.length, global)]
    const row = new MessageActionRow().addComponents(buttons)

    const scores = lb.Scores.slice(offset, offset + 10)
    const formated = (await Promise.all(scores.map((score, i) => formatLbScore(score, map, offset+i, lb.UserScore?.position === offset + i + 1)))).join("\n")
    const embed = new MessageEmbed()
        .setAuthor(author)
        .setDescription(formated)
        .setThumbnail(map.BeatmapSet.Covers["list@2x"])
    return {
        embeds: [embed], components: [row]
    }
}

const newButton = (id: string, label: string, offset: number, totalScores: number, global: boolean) => {
    offset = offset >= totalScores ? 0 : offset < 0 ? Math.floor((totalScores-1) / 10) * 10 : offset
    const button = new MessageButton()
        .setCustomId(`${global ? "" : "country "}leaderboards;${offset};${id};${pseudoRandomBytes(16).toString("hex")}`)
        .setLabel(label)
        .setStyle(1)
    return button
}