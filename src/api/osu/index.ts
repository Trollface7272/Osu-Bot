import cProfile from "./endpoints/profile"
import { Post } from "./functions"
import logger from "@functions/logger"

class cOsuApi {
    private Token: string
    public Profile: cProfile
    constructor(key: string) {
        this.Token = key
        this.Profile = new cProfile(this.Token)
    }
    static async new(secret: string) {
        return (async () => {
            let {token_type, expires_in, access_token, ...data} = await Post("https://osu.ppy.sh/oauth/token", {
                client_id: "11234",
                client_secret: secret,
                grant_type: "client_credentials",
                scope: "public"
            })
            if (!token_type || !expires_in || !access_token) throw { error: "While getting access token!", response: data}
            return new cOsuApi(`${token_type} ${access_token}`)
        })()
    }
}

export let OsuApi: cOsuApi
cOsuApi.new(process.env.OSU).then(e => OsuApi = e)
export const Profile = cProfile