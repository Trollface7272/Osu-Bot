
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
    public deleted_at: string|null
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
    public hype: number|null
    public id: number
    public nsfw: boolean
    public play_count: number
    public preview_url: string
    public source: string
    public status: string
    public title: string
    public title_unicode: string
    public track_id: number|null
    public user_id: number
    public video: boolean
}