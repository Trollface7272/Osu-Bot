import { InteractionCache } from "@api/cache/Interactions"
import { GetOsuProfile, HandleError, HandlePromise, ParseArgs, parsedArgs } from "@functions/utils"
import { OsuApi } from "@osuapi/index"
import { Utils } from "@osuapi/functions"
import { ButtonInteraction, CommandInteraction, Message, MessageOptions } from "discord.js"
import { Score } from "@osuapi/endpoints/score"
import { GetUser } from "@database/users"

const formatSingleScorePost = (score: Score.Recent): MessageOptions => {

    return {}
}

const recent = async (id: string, {Name, Gamemode}: parsedArgs): Promise<MessageOptions> => {
    let osuId = await Utils.lookupName(Name ?? (await GetUser(id)).osu.id as any, id)

    const [scores, err] = await HandlePromise<Score.Recent[]>(OsuApi.Score.GetRecent({OAuthId: id, id: osuId, mode: Gamemode, fails: true }))
    if (err) return HandleError(err)

    return {content: `Total: ${scores.length}\n Passes: ${scores.filter(el => el.Rank !== "F").length}`}
}

const messageCallback = async (message: Message, args: string[]) => {
    const params = ParseArgs(args, message.content.toLocaleLowerCase().split(" ")[0])
    const data = await recent(message.author.id, params)


    message.reply(data)
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