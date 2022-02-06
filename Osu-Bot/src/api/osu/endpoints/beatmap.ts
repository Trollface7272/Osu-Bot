import logger from "@functions/logger"
import { v2ApiLink } from "@osuapi/consts"
import { Errors, OsuApiError } from "@osuapi/error"
import { Utils } from "@osuapi/functions"
import { ResponseTypes } from "@osuapi/response_types/ResponseTypes"
import { OAuth2Manager } from "api/oAuth2/oAuth"
import { AxiosError } from "axios"

export namespace Beatmaps {

    export class Compact {
        public raw: ResponseTypes.Beatmap.Compact

        public get Id() { return this.raw.id }
        public get Url() { return `https://osu.ppy.sh/b/${this.Id}` }
        public get SetId() { return this.raw.beatmapset_id }
        public get StarRating() { return this.raw.difficulty_rating }
        public get Mode() { return this.raw.mode }
        public get Status() { return this.raw.status }
        public get Length() { return { total: this.raw.total_length } }
        public get MapperId() { return this.raw.user_id }
        public get Version() { return this.raw.version }

        constructor(raw: ResponseTypes.Beatmap.Compact) { this.raw = raw }
    }

    export class Base extends Compact {
        declare public raw: ResponseTypes.Beatmap.Base

        public get Difficulty() { return { AR: this.raw.ar, CS: this.raw.cs, HP: this.raw.drain, OD: this.raw.accuracy } }
        public get Bpm() { return this.raw.bpm }
        public get Is() { return { convert: this.raw.convert, scorable: this.raw.is_scoreable } }
        public get Counts() { return { circles: this.raw.count_circles, sliders: this.raw.count_sliders, spinners: this.raw.count_spinners } }

        public get DeletedAt() { return this.raw.deleted_at }
        public get Length() { return { drain: this.raw.hit_length, total: this.raw.total_length } }
        public get LastUpdated() { return this.raw.last_updated }
        public get ModeNum() { return this.raw.mode_int }
        public get Passes() { return this.raw.passcount }
        public get Playcount() { return this.raw.playcount }
        public get RankedStatus() { return this.raw.ranked }
        public get Url() { return this.raw.url }
        public get MaxCombo() { return this.raw.max_combo }

        constructor(raw: ResponseTypes.Beatmap.Base) { super(raw as ResponseTypes.Beatmap.Base) }
    }

    export class FromId extends Base {
        declare public raw: ResponseTypes.Beatmap.FromId

        public get BeatmapSet() { return new Sets.Base(this.raw.beatmapset) } //TODO new Beatmapset
        public get Failtimes() { return this.raw.failtimes }
        public get MaxCombo() { return this.raw.max_combo }
        constructor(raw: ResponseTypes.Beatmap.FromId) { super(raw) }
    }

    export class FromIds extends Compact {
        declare public raw: ResponseTypes.Beatmap.FromIds

        public get BeatmapSet() { return new Sets.Compact(this.raw.beatmapset) } //TODO new Beatmapset
        public get Failtimes() { return this.raw.failtimes }
        public get MaxCombo() { return this.raw.max_combo }
        constructor(raw: ResponseTypes.Beatmap.FromIds) { super(raw) }
    }

    export class Lookup extends FromId { }

    export namespace Sets {
        export class Compact {
            public raw: ResponseTypes.BeatmapSet.Compact

            public get Artist() { return this.raw.artist }
            public get ArtistUnicode() { return this.raw.artist_unicode }
            public get Covers() { return this.raw.covers }
            public get Mapper() { return this.raw.creator }
            public get Favourites() { return this.raw.favourite_count }
            public get Id() { return this.raw.id }
            public get Is() { return { nsfw: this.raw.nsfw } }
            public get PlayCount() { return this.raw.play_count }
            public get Preview() { return this.raw.preview_url }
            public get Source() { return this.raw.source }
            public get Status() { return this.raw.status }
            public get Title() { return this.raw.title }
            public get TitleUnicode() { return this.raw.title_unicode }
            public get MapperId() { return this.raw.user_id }
            public get Video() { return this.raw.video }

            constructor(raw: ResponseTypes.BeatmapSet.Compact) { this.raw = raw }
        }
        export class Base extends Compact {
            declare public raw: ResponseTypes.BeatmapSet.Base

            public get Availability() { return this.raw.availability }
            public get Bpm() { return this.raw.bpm }
            public get Is() { return { nsfw: this.raw.nsfw, hypable: this.raw.can_be_hyped, scorable: this.raw.is_scoreable } }
            public get DiscussionEnabled() { return this.raw.discussion_enabled }
            public get DiscussionLocked() { return this.raw.discussion_locked }
            public get Hype() { return this.raw.hype }
            public get LastUdated() { return new Date(this.raw.last_updated) }
            public get LegacyThreadUrl() { return this.raw.legacy_thread_url }
            public get Nominations() { return this.raw.nominations }
            public get NominationsSummary() { return this.raw.nominations_summary }
            public get Ranked() { return this.raw.ranked }
            public get RankedDate() { return new Date(this.raw.ranked_date) }
            public get Storyboard() { return this.raw.storyboard }
            public get SubmittedDate() { return this.raw.submitted_date }
            public get Tags() { return this.raw.tags }
            constructor(raw: ResponseTypes.BeatmapSet.Base) { super(raw); this.raw = raw }
        }
        export class SearchSet extends Base {
            declare public raw: ResponseTypes.BeatmapSet.SearchSet

            public get TrackId() { return this.raw.track_id }
            public get Beatmaps() { return this.raw.beatmaps.map(map => new Beatmaps.Base(map)) }

            constructor(raw: ResponseTypes.BeatmapSet.SearchSet) { super(raw); this.raw = raw }
        }
        export class Search {
            declare public raw: ResponseTypes.BeatmapSet.Search

            public get BeatmapSets() { return this.raw.beatmapsets.map(maps => new SearchSet(maps)) }
            public get Cursor() { return { approved_date: new Date(this.raw.cursor.approved_date), _id: this.raw.cursor._id } }
            public get Search() { return { sort: this.raw.search.sort } }
            public get RecommendedDifficulty() { return { sort: this.raw.recommended_difficulty } }
            public get Error() { return { sort: this.raw.error } }
            public get Total() { return { sort: this.raw.total } }

            constructor(raw: ResponseTypes.BeatmapSet.Search) { this.raw = raw }
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
        type?: string
        text?: string
        OAuthId?: string
    }

    export interface BeatmapByIdOptions {
        OAuthId?: string
        id: string | number
    }

    export class Api {
        private OAuth: OAuth2Manager
        constructor(a: OAuth2Manager) { this.OAuth = a }

        public async ByIds({ id, mode, OAuthId }: BeatmapFromIdOptions) {
            const formatted = id.map(i => "ids[]=" + i).join("&")

            const endpoint = `${v2ApiLink}/beatmaps?${formatted}`

            const [data, err]: [{ beatmaps: ResponseTypes.Beatmap.FromIds[] }, AxiosError] = await Utils.HandlePromise<{ beatmaps: ResponseTypes.Beatmap.FromIds[] }>(Utils.Get(endpoint, {}, { Authorization: await Utils.GetUserToken(this.OAuth, OAuthId) }, {}))
            if (err) Utils.Error(err, endpoint)

            if (!data || !data.beatmaps || data.beatmaps.length == 0) throw new OsuApiError(Errors.BeatmapDoesNotExist, "Selecred beatmap does not exist")

            return data.beatmaps.map(map => new FromIds(map))
        }
        public async Search({ mode, type, text, OAuthId }: BeatmapSearchOptions) {
            const endpoint = `${v2ApiLink}/beatmapsets/search?${mode ? `m=${mode}&` : ""}${type ? `s=${type}&` : ""}${text ? `q=${text}&` : ""}`
            const [data, err]: [ResponseTypes.BeatmapSet.Search, AxiosError] = await Utils.HandlePromise<ResponseTypes.BeatmapSet.Search>(Utils.Get(endpoint, {}, { Authorization: await Utils.GetUserToken(this.OAuth, OAuthId) }, {}))
            if (err) Utils.Error(err, endpoint)

            if (!data || !data.beatmapsets || data.beatmapsets.length == 0) throw new OsuApiError(Errors.BeatmapDoesNotExist, "Selecred beatmap does not exist")

            return new Beatmaps.Sets.Search(data)
        }
        public async ById({ id, OAuthId }) {
            const endpoint = `${v2ApiLink}/beatmaps/${id}`

            const [data, err] = await Utils.HandlePromise<ResponseTypes.Beatmap.FromId>(Utils.Get(endpoint, {}, { Authorization: await Utils.GetUserToken(this.OAuth, OAuthId) }))
            if (err) Utils.Error(err, endpoint)

            return new FromId(data)
        }
    }
}