import { HandlePromise, ParseArgs, parsedArgs, HandleError, FindMapInConversation } from "@functions/utils"
import { Beatmaps } from "@osuapi/endpoints/beatmap"
import { Score } from "@osuapi/endpoints/score"
import { OsuApi } from "@osuapi/index"
import { InteractionCache } from "@api/cache/Interactions"
import { randomBytes } from "crypto"
import { ButtonInteraction, CommandInteraction, Message, MessageOptions } from "discord.js"
import { format } from "./_formatLbScore"



const newLaderboards = async (id: string, country: boolean, { Map, Specific }: parsedArgs): Promise<MessageOptions> => {
    const [map, er] = await HandlePromise<Beatmaps.FromId>(OsuApi.Beatmap.ById({ id: parseInt(Map), OAuthId: id }))
    if (er) return HandleError(er)

    const [lb, err] = await HandlePromise<Score.BeatmapScores>(OsuApi.Score.Leaderboards({ id: parseInt(Map), country: true, OAuthId: id }))
    if (err) return HandleError(err)

    let offset = Specific[0] * 10 || 0
    if (offset < 0 || offset > lb.Scores.length) offset = 0
    const intId = randomBytes(16).toString("hex")
    InteractionCache.Add(intId, { map, lb })
    
    

    return format(lb, map, offset, intId, false)
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
    const d = InteractionCache.LookUp(id)
    if (!d) return
    const { lb, map } = d

    interaction.update(await format(lb, map, parseInt(offset), id, false))
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
    name: "country leaderboards",
    callback: interactionCallback
}