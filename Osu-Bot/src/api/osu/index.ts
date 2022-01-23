import cBeatmap from "./endpoints/beatmap"
import cProfile from "./endpoints/profile"
import cScore from "./endpoints/score"
import cNews from "./endpoints/news"
import { Errors } from "./error"
import { Post } from "./functions"

class cOsuApi {
    private Token: string
    public Profile: cProfile
    public Score: cScore
    public Beatmap: cBeatmap
    public News: cNews
    constructor(key: string) {
        this.Token = key
        this.Profile = new cProfile(this.Token)
        this.Score = new cScore(this.Token)
        this.Beatmap = new cBeatmap(this.Token)
        this.News = new cNews(this.Token)
    }
    public static async new() {
        return (async () => {
            let { token_type, expires_in, access_token, ...data } = await Post("https://osu.ppy.sh/oauth/token", {
                client_id: process.env.OSUID,
                client_secret: process.env.OSU,
                grant_type: "client_credentials",
                scope: "public"
            })
            if (!token_type || !expires_in || !access_token) throw { error: Errors.InvalidOsuApp, response: data }
            return new cOsuApi(`${token_type} ${access_token}`)
        })()
    }
}

export let OsuApi: cOsuApi
cOsuApi.new().then(e => OsuApi = e)
export const Profile = cProfile