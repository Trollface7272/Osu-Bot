
export class BeatmapRaw {
    public beatmapset_id: number
    public difficulty_rating: number
    public id: number
    public mode: string
    public status: string
    public total_length: number
    public user_id: number
    public version: string
    public accuracy: string
    public ar: string
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
    public mode_int: string
    public passcount: string
    public playcount: string
    public ranked: string
    public url: string
    public checksum: string
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

    constructor(raw: BeatmapRaw) {
        this.raw = raw
    }
}

export class BeatmapSet {
    private raw: BeatmapSetRaw

    public get Artist() { return this.raw.artist }
    public get ArtistUnicode() { return this.raw.artist_unicode }
    public get Covers() { return this.raw.covers }
    public get Mapper() { return this.raw.creator }
    public get FavouritedCount() { return this.raw.favourite_count }
    public get HypeCount() { return this.raw.hype }
    public get Id() { return this.raw.id }
    public get Is() {
        return {
            nsfw: this.raw.nsfw
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

    constructor(raw: BeatmapSetRaw) {
        this.raw = raw
    }
}