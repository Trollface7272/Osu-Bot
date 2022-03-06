import BeatmapSet from "./BeatmapSet"
export namespace ______ {
    export interface Compact {
        beatmapset_id: number
        difficulty_rating: number
        id: number
        mode: string
        status: "graveyard" | "wip" | "pending" | "ranked" | "approved" | "qualified" | "loved"
        total_length: number
        user_id: number
        version: string
    }
    export interface Base extends Compact {
        accuracy: number
        ar: number
        bpm: number
        convert: boolean
        count_circles: number
        count_sliders: number
        count_spinners: number
        cs: number
        deleted_at: string | null
        drain: number
        hit_length: number
        is_scoreable: boolean
        last_updated: string
        mode_int: 0 | 1 | 2 | 3
        passcount: string
        playcount: string
        ranked: string
        url: string
        max_combo?: number
    }
    export interface FromId extends Base {
        beatmapset: BeatmapSet.Beatmap.FromId
        failtimes: { fail: number[], exit: number[] }
        max_combo: number
    }
    export interface FromIds extends Compact {
        beatmapset: BeatmapSet.Beatmap.FromIds //With rating
        failtimes: { fail: number[], exit: number[] }
        max_combo: number
    }
    export interface Lookup extends FromId { }
}

export default ______