import { v2ApiLink } from "@osuapi/consts"
import { Errors, OsuApiError } from "@osuapi/error"
import { Utils } from "@osuapi/functions"
import { OAuth2Manager } from "api/oAuth2/oAuth"
import { AxiosError } from "axios"

export namespace Beatmaps {

    export class BeatmapRaw {
        public beatmapset_id: number
        public difficulty_rating: number
        public id: number
        public mode: string
        public status: string
        public total_length: number
        public user_id: number
        public version: string
        public accuracy: number
        public ar: number
        public bpm: string
        public convert: boolean
        public count_circles: number
        public count_sliders: number
        public count_spinners: number
        public cs: number
        public deleted_at: string | null
        public drain: number
        public hit_length: number
        public is_scoreable: boolean
        public last_updated: string
        public mode_int: 0 | 1 | 2 | 3
        public passcount: string
        public playcount: string
        public ranked: string
        public url: string
        public checksum: string
        public max_combo: number
    }

    export class BeatmapSetRaw {
        public artist: string
        public artist_unicode: string
        public covers: {
            cover: string
            "cover@2x": string
            card: string
            "card@2x": string
            list: string
            "list@2x": string
            slimcover: string
            "slimcover@2x": string
        }
        public creator: string
        public favourite_count: number
        public hype: number | null
        public id: number
        public nsfw: boolean
        public play_count: number
        public preview_url: string
        public source: string
        public status: string
        public title: string
        public title_unicode: string
        public track_id: number | null
        public user_id: number
        public video: boolean
        public availability
        public bpm: number
        public can_be_hyped: boolean
        public discussion_enabled: boolean
        public discussion_locked: boolean
        public is_scoreable: boolean
        public last_updated: string
        public legacy_thread_url: string
        public nominations_summary
        public ranked: 1 | 0
        public ranked_date: string
        public storyboard: boolean
        public submitted_date: string
        public tags: string
        public beatmaps: BeatmapRaw[]
    }

    export class Beatmap {
        private raw: BeatmapRaw

        public get SetId() { return this.raw.beatmapset_id }
        public get Stars() { return this.raw.difficulty_rating }
        public get Id() { return this.raw.id }
        public get Mode() { return this.raw.mode }
        public get RankedStatus() { return this.raw.status }
        public get Length() { return this.raw.total_length }
        public get DrainLength() { return this.raw.hit_length }
        public get MapperId() { return this.raw.user_id }
        public get Version() { return this.raw.version }
        public get Difficulty() {
            return {
                OD: this.raw.accuracy,
                AR: this.raw.ar,
                CS: this.raw.cs,
                HP: this.raw.drain
            }
        }
        public get Bpm() { return this.raw.bpm }
        public get Is() {
            return {
                Convert: this.raw.convert,
                Scorable: this.raw.is_scoreable,
                Ranked: this.raw.ranked,
            }
        }
        public get Objects() {
            return {
                Circles: this.raw.count_circles,
                Sliders: this.raw.count_sliders,
                Spinners: this.raw.count_spinners
            }
        }
        public get DeletedDate() { return this.raw.deleted_at }
        public get LastUpdated() { return this.raw.last_updated }
        public get GamemodeNum() { return this.raw.mode_int }
        public get Passes() { return this.raw.passcount }
        public get Plays() { return this.raw.playcount }
        public get Url() { return this.raw.url }
        public get Hash() { return this.raw.checksum }
        public get MaxCombo() { return this.raw.max_combo }
        public set MaxCombo(value) { this.raw.max_combo = value }

        constructor(raw: BeatmapRaw) {
            this.raw = raw
        }
    }

    export class BeatmapSet {
        private raw: BeatmapSetRaw
        private beatmaps: Beatmap[]

        public get Artist() { return this.raw.artist }
        public get ArtistUnicode() { return this.raw.artist_unicode }
        public get Covers() { return this.raw.covers }
        public get Mapper() { return this.raw.creator }
        public get FavouritedCount() { return this.raw.favourite_count }
        public get HypeCount() { return this.raw.hype }
        public get Id() { return this.raw.id }
        public get Is() {
            return {
                Nsfw: this.raw.nsfw,
                Hypable: this.raw.can_be_hyped,
                DiscussionEnabled: this.raw.discussion_enabled,
                DiscussionLocked: this.raw.discussion_locked,
                Scorable: this.raw.is_scoreable
            }
        }
        public get PlayCount() { return this.raw.play_count }
        public get PreviewUrl() { return this.raw.preview_url }
        public get Source() { return this.raw.source }
        public get Status() { return this.raw.status }
        public get Title() { return this.raw.title }
        public get TitleUnicode() { return this.raw.title_unicode }
        public get TrackId() { return this.raw.track_id }
        public get MapperId() { return this.raw.user_id }
        public get hasVideo() { return this.raw.video }
        public get Availability() { return this.raw.availability }
        public get Bpm() { return this.raw.bpm }
        public get LastUpdated() { return new Date(this.raw.last_updated) }
        public get LegacyThreadUrl() { return this.raw.legacy_thread_url }
        public get Naminations() { return this.raw.nominations_summary }
        public get Ranked() { return this.raw.ranked }
        public get RankedDate() { return new Date(this.raw.ranked_date) }
        public get Storyboard() { return this.raw.storyboard }
        public get SubmittedDate() { return new Date(this.raw.submitted_date) }
        public get Tags() { return this.raw.tags }
        public get Beatmaps() { return this.beatmaps }

        constructor(raw: BeatmapSetRaw) {
            this.raw = raw
            this.beatmaps = raw.beatmaps?.map(map => new Beatmap(map))
        }
    }

    export interface BeatmapFromIdOptions {
        id: string[]
        mode?: 0 | 1 | 2 | 3
        token?: string
        OAuthId?: string
    }

    export interface BeatmapSearchOptions {
        mode?: 0 | 1 | 2 | 3
        token?: string
        type?: string
        text?: string
        OAuthId?: string
    }

    export class Api {
        private OAuth: OAuth2Manager
        constructor(a: OAuth2Manager) { this.OAuth = a }

        public async ByIds({ id, mode, OAuthId }: BeatmapFromIdOptions) {
            const formatted = id.map(i => "ids[]=" + i).join("&")

            const endpoint = `${v2ApiLink}/beatmaps?${formatted}`

            const [data, err]: [{ beatmaps: BeatmapRaw[] }, AxiosError] = await Utils.HandlePromise<{ beatmaps: BeatmapRaw[] }>(Utils.Get(endpoint, {}, { Authorization: await Utils.GetUserToken(this.OAuth, OAuthId) }, {}))
            if (err) {
                if (err.response.status == 401) throw new OsuApiError(Errors.BadToken, "Provided invalid token")
                if (err.response.status == 403) throw new OsuApiError(Errors.BadToken, "Provided invalid token")
                if (err.response.status == 404) throw new OsuApiError(Errors.WrongEndpoint, "Provided invalid api endpoint")
                throw new OsuApiError(Errors.Unknown, err)
            }

            if (!data || !data.beatmaps || data.beatmaps.length == 0) throw new OsuApiError(Errors.BeatmapDoesNotExist, "Selecred beatmap does not exist")

            return data.beatmaps.map(map => new Beatmap(map))
        }
        public async Search({ mode, type, text, OAuthId }: BeatmapSearchOptions) {
            const endpoint = `${v2ApiLink}/beatmapsets/search?${mode ? `m=${mode}&` : ""}${type ? `s=${type}&` : ""}${text ? `q=${text}&` : ""}`
            const [data, err]: [{ beatmapsets: BeatmapSetRaw[] }, AxiosError] = await Utils.HandlePromise<{ beatmapsets: BeatmapSetRaw[] }>(Utils.Get(endpoint, {}, { Authorization: await Utils.GetUserToken(this.OAuth, OAuthId) }, {}))
            if (err) {
                if (err.response.status == 401) throw new OsuApiError(Errors.BadToken, "Provided invalid token")
                if (err.response.status == 403) throw new OsuApiError(Errors.BadToken, "Provided invalid token")
                if (err.response.status == 404) throw new OsuApiError(Errors.WrongEndpoint, "Provided invalid api endpoint")
                throw new OsuApiError(Errors.Unknown, err)
            }

            if (!data || !data.beatmapsets || data.beatmapsets.length == 0) throw new OsuApiError(Errors.BeatmapDoesNotExist, "Selecred beatmap does not exist")

            return data.beatmapsets.map(map => new BeatmapSet(map))
        }
    }
}