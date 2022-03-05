import Beatmaps from "./Beatmap"
import BeatmapSets from "./BeatmapSet"
import User from "./Profile"
namespace ______ {
    //Helper types
    export interface Statistics {
        count_50: number
        count_100: number
        count_300: number
        count_geki: number
        count_katu: number
        count_miss: number
    }
    export interface Weight {
        percentage: number
        pp: number
    }

    //Api Types
    export interface Base {
        index: number
        id: number
        best_id: number
        user_id: number
        accuracy: number
        mods: string[]
        score: number
        max_combo: number
        perfect: boolean
        statistics: Statistics
        passed: boolean
        pp: number
        rank: "SS" | "SSH" | "SH" | "S" | "A" | "B" | "C" | "D" | "F"
        created_at: string
        mode: "osu"|"fruits"|"taiko"|"mania"
        mode_int: 0 | 1 | 2 | 3
        replay: boolean
    }
    export interface Recent extends Base {
        beatmap: Beatmaps.Base
        beatmapset: BeatmapSets.Compact
        user: User.Compact
    }
    export interface Firsts extends Recent { }
    export interface Best extends Recent {
        weight: Weight
    }
    export interface Leaderboards extends Base {
        user: User.Compact
    }
    export interface BeatmapUserScore {
        position: number
        score: Base
    }
    export interface BeatmapScores {
        scores: Base[]
        userScore?: BeatmapUserScore
    }
}

export default ______