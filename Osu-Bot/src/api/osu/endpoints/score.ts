import { GameModes, v2ApiLink } from "@osuapi/consts"
import { Errors, OsuApiError } from "@osuapi/error"
import { Utils } from "@osuapi/functions"
import { ResponseTypes } from "@osuapi/response_types/ResponseTypes"
import { GameMode } from "@osuapi/types/api_enums"
import { OAuth2Manager } from "api/oAuth2/oAuth"
import { AxiosError } from "axios"
import { Beatmaps } from "./beatmap"
import { Profile } from "./profile"

export namespace Score {

    export class Base {
        public raw: ResponseTypes.Score.Base

        public get Index() { return this.raw.index }
        public get Id() { return this.raw.id }
        public get BestId() { return this.raw.best_id }
        public get UserId() { return this.raw.user_id }
        public get Accuracy() { return this.raw.accuracy }
        public get Mods() { return this.raw.mods.map(e => e) }
        public get Score() { return this.raw.score }
        public get MaxCombo() { return this.raw.max_combo }
        public get Perfect() { return this.raw.perfect }
        public get Statistics() { return this.raw.statistics }
        public get Passed() { return this.raw.passed }
        public get Pp() { return this.raw.pp }
        public get Rank() { return this.raw.rank }
        public get CreatedAt() { return new Date(this.raw.created_at) }
        public get Mode() { return this.raw.mode }
        public get ModeInt() { return this.raw.mode_int }
        public get HasReplay() { return this.raw.replay }
        public get Counts() { return { "50": this.raw.statistics.count_50, "100": this.raw.statistics.count_100, "300": this.raw.statistics.count_300, "geki": this.raw.statistics.count_geki, "katu": this.raw.statistics.count_katu, "miss": this.raw.statistics.count_miss } }
        public get Replay() { return this.HasReplay ? `https://osu.ppy.sh/scores/${this.Mode}/${this.Id}/download` : null }
        public get ScoreUrl() { return `https://osu.ppy.sh/scores/${this.Mode}/${this.Id}` }

        constructor(raw: ResponseTypes.Score.Base) { this.raw = raw }
    }
    export class Recent extends Base {
        declare public raw: ResponseTypes.Score.Recent

        public SetCombo(combo: number) { this.raw.beatmap.max_combo = combo }
        public get Beatmap() { return new Beatmaps.Base(this.raw.beatmap) }
        public get BeatmapSet() { return new Beatmaps.Sets.Compact(this.raw.beatmapset) }
        public get User() { return new Profile.Compact(this.raw.user) }

        constructor(raw: ResponseTypes.Score.Recent) { super(raw); this.raw = raw }
    }
    export class Firsts extends Recent { }
    export class Best extends Recent {
        declare raw: ResponseTypes.Score.Best

        public get Weight() { return { percentage: this.raw.weight.percentage, pp: this.raw.weight.pp } }

        constructor(raw: ResponseTypes.Score.Best) { super(raw); this.raw = raw }
    }
    export class Leaderboards extends Base {
        declare raw: ResponseTypes.Score.Best
        public get User() { return new Profile.Compact(this.raw.user) }
        constructor(raw) {super(raw);this.raw = raw}
    }
    
    export class BeatmapUserScore {
        private raw: ResponseTypes.Score.BeatmapUserScore
        public get Position() { return this.raw.position }
        public get Score() { return new Leaderboards(this.raw.score) }
        constructor(raw: ResponseTypes.Score.BeatmapUserScore) {}
    }

    export class BeatmapScores {
        private raw: ResponseTypes.Score.BeatmapScores
        public get Scores() { return this.raw.scores.map(e => new Leaderboards(e)) }
        public get UserScore() { return this.raw.userScore }

        constructor(raw: ResponseTypes.Score.BeatmapScores) {this.raw = raw}
    }


    export interface BestParams {
        id?: number, mode?: 0 | 1 | 2 | 3, self?: boolean, limit?: number, offset?: number, OAuthId?: string
    }

    export interface RecentParams {
        id?: number, mode?: 0 | 1 | 2 | 3, self?: boolean, limit?: number, offset?: number, OAuthId?: string, fails?: boolean
    }

    export interface LeaderboardsParams {
        id: number, mode?: number|string, mods?: number, type?: string, OAuthId?: string
    }

    export class Api {
        private OAuth: OAuth2Manager
        constructor(a: OAuth2Manager) { this.OAuth = a }

        public async Get<T>(endpoint: string, params: any, OAuthId: string) {
            const [data, err]: [T, AxiosError] = await Utils.HandlePromise<T>(Utils.Get(endpoint, params, { Authorization: await Utils.GetUserToken(this.OAuth, OAuthId) }))

            if (err) Utils.Error(err, endpoint)

            if (!data) throw new OsuApiError(Errors.PlayerDoesNotExist, "Selecred player does not exist")

            return data
        }

        private async _Get<T>({ id, mode, limit = 100, offset = 0, OAuthId }: BestParams, type: string, Type: any, otherParams?: any) {
            if (!id) throw new OsuApiError(Errors.InvalidId, "Provided invalid id")
            const endpoint = `${v2ApiLink}/users/${id}/scores/${type}`
            const params = {
                mode: GameModes[mode],
                limit, offset, ...otherParams
            }
            const data = await this.Get<T[]>(endpoint, params, OAuthId)

            //@ts-ignore
            return data.map((score, index) => { score.index = index + offset + 1; return new Type(score) })
        }

        public async GetBest(param: BestParams) {
            return this._Get<ResponseTypes.Score.Best>(param, "best", Best)
        }

        public async GetFirsts(param: BestParams) {
            return this._Get<ResponseTypes.Score.Firsts>(param, "firsts", Firsts)
        }

        public async GetRecent(param: RecentParams) {
            return this._Get<ResponseTypes.Score.Recent>(param, "recent", Recent, { include_fails: param.fails ? "1" : "0"})
        }

        public async GetPinned(param: BestParams) {
            return this._Get<ResponseTypes.Score.Best>(param, "pinned", Best)
        }

        public async Leaderboards({ id, mode, mods, type, OAuthId }: LeaderboardsParams) {
            if (typeof mode === "number") mode = GameMode[mode]
            const endpoint = `${v2ApiLink}/beatmaps/${id}/scores`
            const params = {
                mode: mode || "osu",
                mods: mods ?? undefined,
                type: type
            }
            const data = await this.Get<ResponseTypes.Score.BeatmapScores>(endpoint, params, OAuthId)
            return new BeatmapScores(data)
        }
    }
}