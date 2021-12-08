import { GameMode, ProfilePage } from "./api_enums"

export interface iUserCompactRaw {
    avatar_url: string
    country_code: string
    default_group: string
    id: number
    is_active: boolean
    is_bot: boolean
    is_deleted: boolean
    is_online: boolean
    is_supporter: boolean
    last_visit?: string|Date
    pm_friends_only: boolean
    profile_colour: string
    username: string

    //Optional
    account_history?: iUserAccountHistoryRaw[]
    active_tournament_banner?: iUserBannerRaw
    beatmap_playcounts_count?: number
    country?: iUserCountryRaw
    cover?: iUserCoverRaw
    favourite_beatmapset_count?: number
    follower_count?: number
    graveyard_beatmapset_count?: number
    is_restricted?: boolean
    loved_beatmapset_count?: number
    monthly_playcounts?: iUserMonthlyPlaycountRaw[]
    badges?: iUserBadgeRaw[]
    page?: iUserPageRaw
    pending_beatmapset_count?: number
    previous_usernames?: string[]
    rank_history?: iUserRankHistoryRaw
    ranked_beatmapset_count?: number
    replays_watched_counts?: iUserReplaysWatchedRaw[]
    scores_best_count?: number
    scores_first_count?: number
    scores_recent_count?: number
    statistics?: iUserStatisticsRaw
    support_level?: 0|1|2|3
    unread_pm_count?: number
    user_achievements?: iUserAchievementRaw[]

    //Undocumented
    user_preferences?: any
    statistics_rulesets?: any
    blocks?: any
    groups?: any
    friends?: any
}

export interface iUserRaw extends iUserCompactRaw {
    cover_url: string
    discord?: string
    has_supported: boolean
    interests?: string
    join_date: string
    kudosu: {
        total: number
        available: number
    },
    rank: {
        global: number
        country: number
    }
    location?: string
    max_blocks: number
    max_friends: number
    occupation?: string
    playmode: GameMode
    playstyle: string[]
    post_count: number
    profile_order: ProfilePage[]
    title?: string
    title_url?: string
    twitter?: string
    website?: string
}

export interface iUserAccountHistoryRaw {
    description?: string	
    id: number	
    length: number
    timestamp: string	
    type: string
}

export interface iUserBannerRaw {
    id: number	
    tournament_id: number	
    image: string	
}

export interface iUserCountryRaw {
    code: string
    name: string
}

export interface iUserCoverRaw {
    custom_url: string
    url: string
    id: number
}

export interface iUserBadgeRaw {
    awarded_at: string	
    description: string	
    image_url: string	
    url: string
}

export interface iUserMonthlyPlaycountRaw {
    start_date: string,
    count: number
}

export interface iUserPageRaw {
    html: string
    raw: string
}

export interface iUserRankHistoryRaw {
    mode: GameMode
    data: number[]
}

export interface iUserStatisticsRaw {
    level: iUserLevelRaw,
    global_rank: number,
    pp: number,
    ranked_score: number,
    hit_accuracy: number,
    play_count: number,
    play_time: number,
    total_score: number,
    total_hits: number,
    maximum_combo: number,
    replays_watched_by_others: number,
    is_ranked: boolean,
    grade_counts: iUserGradesRaw,
    country_rank: number,
    rank: iUserRankRaw
}

export interface iUserLevelRaw {
    current: number
    progress: number
}

export interface iUserGradesRaw {
    ss: number, 
    ssh: number, 
    s: number,
    sh: number, 
    a: number
}

export interface iUserRankRaw { 
    country: number
    global: number
}

export interface iUserAchievementRaw {
    achieved_at: string
    achievement_id: number
}

export interface iUserReplaysWatchedRaw {
    start_date: string
    count: number
}