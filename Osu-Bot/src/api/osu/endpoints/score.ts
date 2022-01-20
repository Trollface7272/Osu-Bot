import logger from "@functions/logger"
import { GameModes, v2ApiLink } from "@osuapi/consts"
import { Errors, OsuApiError } from "@osuapi/error"
import { Get, HandlePromise } from "@osuapi/functions"
import { GameMode, ScoreGrade } from "@osuapi/types/api_enums"
import { AxiosError } from "axios"
import { Beatmap, BeatmapRaw, BeatmapSet, BeatmapSetRaw } from "./beatmap"

export class ScoreUserRaw {
    public avatar_url: string
    public country_code: string
    public default_group: string
    public id: number
    public is_active: boolean
    public is_bot: boolean
    public is_deleted: boolean
    public is_online: boolean
    public is_supporter: boolean
    public last_visit: string
    public pm_friends_only: boolean
    public profile_colour: string | null
    public username: string
}

export class ScoreRaw {
    public id: number
    public user_id: number
    public accuracy: number
    public mods: string[]
    public score: number
    public max_combo: number
    public passed: boolean
    public perfect: boolean
    public statistics: {
        count_50: number
        count_100: number
        count_300: number
        count_geki: number
        count_katu: number
        count_miss: number
    }
    public rank: ScoreGrade
    public created_at: string
    public best_id: number
    public pp: number
    public mode: GameMode
    public mode_int: 0 | 1 | 2 | 3
    public replay: boolean
    public beatmap: BeatmapRaw
    public beatmapset: BeatmapSetRaw
    public weight: {
        percentage: number
        pp: number
    }
    public user: ScoreUserRaw
}

export class ScoreUser {
    public raw: ScoreUserRaw
    public get Avatar() { return this.raw.avatar_url }
    public get Country() {
        return {
            code: this.raw.country_code.toUpperCase(),
            name: new Intl.DisplayNames(["en"], { type: "region" }).of(this.raw.country_code.toUpperCase())
        }
    }
    public get DefaultGroup() { return this.raw.default_group }
    public get id() { return this.raw.id }
    public get is() {
        return {
            active: this.raw.is_active,
            bot: this.raw.is_bot,
            deleted: this.raw.is_deleted,
            online: this.raw.is_online,
            supporter: this.raw.is_supporter
        }
    }
    public get LastVisit() { return new Date(this.raw.last_visit) }
    public get pm_friends_only() { return this.raw.pm_friends_only }
    public get profile_colour() { return this.raw.profile_colour }
    public get username() { return this.raw.username }

    constructor(user: ScoreUserRaw) {
        this.raw = user
    }
}

export class UserBest {
    public raw: ScoreRaw
    private user: ScoreUser
    private beatmap: Beatmap
    private beatmapSet: BeatmapSet

    public get ScoreId() { return this.raw.id }
    public get UserId() { return this.raw.user_id }
    public get Sccuracy() { return this.raw.accuracy }
    public get Mods() { return this.raw.mods.map(e => e) }
    public get Score() { return this.raw.score }
    public get MaxCombo() { return this.raw.max_combo }
    public get Passed() { return this.raw.passed }
    public get Perfect() { return this.raw.perfect }
    public get Counts() {
        return {
            "50": this.raw.statistics.count_50,
            "100": this.raw.statistics.count_100,
            "300": this.raw.statistics.count_300,
            "geki": this.raw.statistics.count_geki,
            "katu": this.raw.statistics.count_katu,
            "miss": this.raw.statistics.count_miss
        }
    }
    public get Grade() { return this.raw.rank }
    public get SetAt() { return this.raw.created_at }
    public get UserBestId() { return this.raw.best_id }
    public get Performance() { return this.raw.pp }
    public get GameMode() { return this.raw.mode }
    public get GameModeRaw() { return this.raw.mode_int }
    public get HasReplay() { return this.raw.replay }
    public get Beatmap() { return this.beatmap }
    public get BeatmapSet() { return this.beatmapSet }
    public get Weighted() {
        return {
            Percantage: this.raw.weight.percentage,
            Performance: this.raw.weight.pp
        }
    }
    public get User() { return this.user }

    constructor(raw: ScoreRaw) {
        this.raw = raw
        this.user = new ScoreUser(raw.user)
        this.beatmap = new Beatmap(raw.beatmap)
        this.beatmapSet = new BeatmapSet(raw.beatmapset)
    }
}

interface bestParams {
    id?: string, mode?: 0 | 1 | 2 | 3, token?: string, self?: boolean, limit?: number, offset?: number
}
class ApiScore {
    private Token: string
    constructor(token: string) { this.Token = token }

    public async GetBest({ id, mode, self, token, limit=4, offset=0 }: bestParams) {
        const endpoint = `${v2ApiLink}/users/${id}/scores/best`
        const params = {
            mode: GameModes[mode],
            limit, offset
        }
        logger.Debug(endpoint, params)
        const [data, err]: [ScoreRaw[], AxiosError] = await HandlePromise<ScoreRaw[]>(Get(endpoint, params, { Authorization: "Bearer " + token || this.Token }))
        logger.Debug(data, err)
        if (err) {
            if (err.response?.status == 401) throw new OsuApiError(Errors.BadToken, "Provided invalid token")
            if (err.response?.status == 403) throw new OsuApiError(Errors.BadToken, "Provided invalid token")
            if (err.response?.status == 404) throw new OsuApiError(Errors.WrongEndpoint, "Provided invalid api endpoint")
            throw new OsuApiError(Errors.Unknown, err)
        }
        if (!data) throw new OsuApiError(Errors.PlayerDoesNotExist, "Selecred player does not exist")
        return data.map(score => new UserBest(score))
    }
}

export default ApiScore