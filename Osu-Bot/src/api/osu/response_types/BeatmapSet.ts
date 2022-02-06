import _Beatmap from "./Beatmap"
namespace ______ {
    //Helper Types
    export interface Covers {
        "cover": string
        "cover@2x": string
        "card": string
        "card@2x": string
        "list": string
        "list@2x": string
        "slimcover": string
        "slimcover@2x": string
    }
    export interface Availability {
        download_disabled: boolean
        more_information?: string
    }
    export interface Hype {
        current: number
        required: number
    }
    export interface Nominations {
        current: number
        required: number
    }

    //BeatmapSet Types
    export interface Compact {
        artist: string
        artist_unicode: string
        covers: Covers
        creator: string
        favourite_count: number
        id: number
        nsfw: boolean
        play_count: number
        preview_url: string
        source: string
        status: string
        title: string
        title_unicode: string
        user_id: number
        video: boolean
        track_id: number
    }
    export interface Base extends Compact {
        availability: Availability
        bpm: number
        can_be_hyped: boolean
        discussion_enabled: boolean
        discussion_locked: boolean
        hype: Hype
        is_scoreable: boolean
        last_updated: string
        legacy_thread_url: string
        nominations?: Nominations
        nominations_summary?: Nominations
        ranked: -2 | -1 | 0 | 1 | 2 | 3 | 4
        ranked_date: string
        storyboard: boolean
        submitted_date: string
        tags: string
    }
    //Beatmapset types for Beatmap endpoints
    export namespace Beatmap {
        export interface FromId extends Base {
            ratings: [number, number, number, number, number, number, number, number, number, number]
        }
        export interface FromIds extends Compact {
            ratings: [number, number, number, number, number, number, number, number, number, number]
        }
        export interface Lookup extends FromId {}
    }
    export interface SearchSet extends Base {
        beatmaps: _Beatmap.Base[]
    }
    export interface Search {
        beatmapsets: SearchSet[]
        cursor: {
            approved_date: string
            _id: string
        },
        search: {
            sort: "string"
        }
        recommended_difficulty?: number
        error?: string
        total: number
    }
}

export default ______