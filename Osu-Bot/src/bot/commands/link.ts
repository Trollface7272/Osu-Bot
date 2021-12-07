import axios from "axios"
import { randomBytes } from "crypto"
import { CommandInteraction } from "discord.js"

export const Link = async (interaction: CommandInteraction) => {
    //https://osu.ppy.sh/oauth/authorize?redirect_uri=http://localhost:727/auth&response_type=code&client_id=11234&state=290850421487042560
    const secret = randomBytes(16).toString("hex")
    await axios.post("http://localhost:727/users/addtempsecret", {
        userId: interaction.user.id, secret: process.env.SECRET, key: secret
    })
    interaction.reply({
        ephemeral: true,
        allowedMentions: {
            repliedUser: false
        },
        content: `https://osu.ppy.sh/oauth/authorize?redirect_uri=${process.env.OSUURL}&response_type=code&client_id=${process.env.OSUID}&state=${secret}`
    })
}

export const interactionCallback = (interaction: CommandInteraction) => {
    Link(interaction)
}

export const name = []

export const interactionCommand = {
    name: "link",
    data: {
        name: "link",
        description: "Link your osu profile",
        type: "CHAT_INPUT"
    },
    callback: interactionCallback
}