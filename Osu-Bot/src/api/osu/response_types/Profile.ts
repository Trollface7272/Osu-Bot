import _Group from "./Group"
namespace ______ {
    //Helper Types
    export interface Kusodu {
        availible: number
        total: number
    }
    export interface Country {
        code: string
        name: string
    }
    export interface Cover {
        custom_url: string
        url: string
        id?: number
    }
    export interface AccountHistory {
        description: string
        id: number
        length: number
        timestamp: string
        type: "note" | "restriction" | "silence"
    }
    export interface ProfileBanner {
        id: number
        tournament_id: number
        image: string
    }
    export interface Badge {
        awarded_at: string
        description: string
        image_url: string
        url: string
    }
    export interface Group extends _Group.Group {
        playmodes?: ("fruits" | "mania" | "osu" | "taiko")[]
    }
    export interface MonthlyPlaycount {
        count: number
        start_date: string
    }
    export interface Page {
        raw: string
        html: string
    }
    export interface RankHistory {
        mode: string
        data: number[]
    }
    export interface ReplaysWatched {
        count: number
        start_date: string
    }
    export interface Grades {
        ss: number
        ssh: number
        s: number
        sh: number
        a: number
    }
    export interface Statistics {
        level: { current: number, progress: number }
        global_rank: string
        pp: number
        ranked_score: number
        hit_accuracy: number
        play_count: number
        play_time: number
        total_score: number
        total_hits: number
        maximum_combo: number
        replays_watched_by_others: number
        is_ranked: boolean
        grade_counts: Grades
        country_rank: number
        rank: { country: number }
    }
    export interface Achievement {
        achieved_at: string
        achievement_id: number
    }
    export interface Giver {
        url: string
        username: string
    }
    export interface Post {
        url: string
        title: string
    }


    //Api Types
    export interface Compact {
        avatar_url: string
        country_code: string
        default_group: string
        id: number
        is_bot: boolean
        is_active: boolean
        is_deleted: boolean
        is_online: boolean
        is_supporter: boolean
        last_visit: string | null
        pm_friends_only: boolean
        profile_colour: string
        username: string
    }
    export interface Base extends Compact {
        cover_url: string
        discord: string | null
        has_supported: boolean
        interests: string | null
        join_date: string
        kudosu: Kusodu
        location: string | null
        max_blocks: number
        max_friends: number
        occupation: string | null
        playmode: "fruits" | "mania" | "osu" | "taiko"
        playstyle: string[]
        post_count: number
        profile_order: ("me" | "recent_activity" | "beatmaps" | "historical" | "kudosu" | "top_ranks" | "medals")[]
        title: string | null
        title_url: string | null
        twitter: string | null
        website: string | null
        country: Country
        cover: Cover
    }
    export interface FromId extends Base {
        account_history: AccountHistory[]
        active_tournament_banner?: ProfileBanner
        badges: Badge[]
        beatmap_playcounts_count: number
        favourite_beatmapset_count: number
        follower_count: number
        graveyard_beatmapset_count: number
        groups: Group[]
        loved_beatmapset_count: number
        mapping_follower_count: number
        monthly_playcounts: MonthlyPlaycount[]
        page: Page
        pending_beatmapset_count: number
        previous_usernames: string[]
        rank_history: RankHistory
        ranked_beatmapset_count: number
        replays_watched_counts: ReplaysWatched[]
        scores_best_count: number
        scores_first_count: number
        scores_recent_count: number
        statistics: Statistics
        support_level: 0 | 1 | 2 | 3
        user_achievements: Achievement[]
    }
    export interface Self extends FromId {
        is_restricted: boolean
        friends?: unknown[]
        statistics_rulesets?: unknown
        unread_pm_count?: number
        user_preferences?: unknown
    }
    export interface KudosuHistory {
        id: number
        action: "give" | "vote.give" | "reset" | "revoke" | "vote.revoke"
        amount: number
        model: string
        created_at: string
        giver: Giver
        post: Post
    }
}

export default ______

/*


*/