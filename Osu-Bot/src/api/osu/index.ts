import { Beatmaps } from "./endpoints/beatmap"
import { Profile } from "./endpoints/profile"
import { Score } from "./endpoints/score"
import { News } from "./endpoints/news"
import { OAuth2Manager } from "../oAuth2/oAuth"

export namespace OsuApiTypes {
    Beatmaps
    Profile
    Score
    News
}

class _OsuApi {
    private OAuth: OAuth2Manager
    public Profile: Profile.Api
    public Score: Score.Api
    public Beatmap: Beatmaps.Api
    public News: News.Api
    constructor() {
        this.OAuth = new OAuth2Manager(process.env.OSUID, process.env.OSU, "public", "https://osu.ppy.sh/oauth/token")
        this.Profile = new Profile.Api(this.OAuth)
        this.Score = new Score.Api(this.OAuth)
        this.Beatmap = new Beatmaps.Api(this.OAuth)
        this.News = new News.Api(this.OAuth)
    }
}

export const OsuApi = new _OsuApi()
//cOsuApi.new().then(e => OsuApi = e)