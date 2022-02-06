namespace ______ {
    //Helper Types
    export interface Beatmap {
        title: string
        url: string
    }
    export interface BeatmapSet {
        title: string
        url: string
    }
    export interface User {
        username: string
        url: string
        previousUsername?: string
    }

    //Api Types
    export interface BaseEvent {
        created_at: string
        id: number
        type: "achievement" | "beatmapPlaycount" | "beatmapsetApprove" | "beatmapsetDelete" | "beatmapsetRevive" | "beatmapsetUpdate" | "beatmapsetUpload" | "rank" | "rankLost" | "userSupportAgain" | "userSupportFirst" | "userSupportGift" | "usernameChange"
    }
    export interface AchievementEvent extends BaseEvent {
        type: "achievement"
        achievement: string
        user: User
    }
    export interface BeatmapPlaycountEvent extends BaseEvent {
        type: "beatmapPlaycount"
        count: number
        beatmap: Beatmap
    }
    export interface BeatmapSetApproveEvent extends BaseEvent {
        type: "beatmapsetApprove"
        approval: "ranked"|"approved"|"qualified"|"loved"
        user: User
        beatmapset: BeatmapSet
    }
    export interface BeatmapSetDeleteEvent extends BaseEvent {
        type: "beatmapsetDelete"
        beatmapset: BeatmapSet
    }
    export interface BeatmapSetReviveEvent extends BaseEvent {
        type: "beatmapsetRevive"
        user: User
        beatmapset: BeatmapSet
    }
    export interface BeatmapSetUpdateEvent extends BaseEvent {
        type: "beatmapsetUpdate"
        user: User
        beatmapset: BeatmapSet
    }
    export interface BeatmapSetUploadEvent extends BaseEvent {
        type: "beatmapsetUpload"
        user: User
        beatmapset: BeatmapSet
    }
    export interface RankEvent extends BaseEvent {
        type: "rank"
        scoreRank: string
        rank: number
        mode: "osu"|"fruits"|"taiko"|"mania"
        user: User
        beatmap: Beatmap
    }
    export interface RankLostEvent extends BaseEvent {
        type: "rankLost"
        mode: "osu"|"fruits"|"taiko"|"mania"
        beatmap: Beatmap
        user: User
    }
    export interface UserSupportAgainEvent extends BaseEvent {
        type: "userSupportAgain"
        user: User
    }
    export interface UserSupportFirstEvent extends BaseEvent {
        type: "userSupportFirst"
        user: User
    }
    export interface UserSupportGiftEvent extends BaseEvent {
        type: "userSupportGift"
        user: User
    }
    export interface UsernameChangeEvent extends BaseEvent {
        type: "usernameChange"
        user: User
    }
}

export default ______