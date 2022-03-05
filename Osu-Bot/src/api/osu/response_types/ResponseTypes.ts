import _Beatmap from "./Beatmap"
import _BeatmapSet from "./BeatmapSet"
import _User from "./Profile"
import _Event from "./Event"
import _Score from "./Score"

export namespace ResponseTypes {
    export namespace Beatmap {
        export interface Compact extends _Beatmap.Compact {}
        export interface Base extends _Beatmap.Base {}
        export interface FromId extends _Beatmap.FromId {}
        export interface FromIds extends _Beatmap.FromIds {}
        export interface Lookup extends _Beatmap.Lookup {}
    }
    export namespace BeatmapSet {
        export interface Compact extends _BeatmapSet.Compact {}
        export interface Base extends _BeatmapSet.Base {}
        export interface SearchSet extends _BeatmapSet.SearchSet {}
        export interface Search extends _BeatmapSet.Search {}
        export namespace Beatmap {
            export interface FromId extends _BeatmapSet.Beatmap.FromId {}
            export interface FromIds extends _BeatmapSet.Beatmap.FromIds {}
            export interface Lookup extends _BeatmapSet.Beatmap.Lookup {}
        }
    }
    export namespace User {
        export interface Compact extends _User.Compact {}
        export interface Base extends _User.Base {}
        export interface FromId extends _User.FromId {}
        export interface Self extends _User.Self {}
        export interface KudosuHistory extends _User.KudosuHistory {}
    }
    export namespace Event {
        export interface BaseEvent extends _Event.BaseEvent {}
        export interface AchievementEvent extends _Event.AchievementEvent {}
        export interface BeatmapPlaycountEvent extends _Event.BeatmapPlaycountEvent {}
        export interface BeatmapSetApproveEvent extends _Event.BeatmapSetApproveEvent {}
        export interface BeatmapSetDeleteEvent extends _Event.BeatmapSetDeleteEvent {}
        export interface BeatmapSetReviveEvent extends _Event.BeatmapSetReviveEvent {}
        export interface BeatmapSetUpdateEvent extends _Event.BeatmapSetUpdateEvent {}
        export interface BeatmapSetUploadEvent extends _Event.BeatmapSetUploadEvent {}
        export interface RankEvent extends _Event.RankEvent {}
        export interface RankLostEvent extends _Event.RankLostEvent {}
        export interface UserSupportAgainEvent extends _Event.UserSupportAgainEvent {}
        export interface UserSupportFirstEvent extends _Event.UserSupportFirstEvent {}
        export interface UserSupportGiftEvent extends _Event.UserSupportGiftEvent {}
        export interface UsernameChangeEvent extends _Event.UsernameChangeEvent {}
    }
    export namespace Score {
        export interface Base extends _Score.Base {}
        export interface Recent extends _Score.Recent {}
        export interface Firsts extends _Score.Firsts {}
        export interface Best extends _Score.Best {}
        export interface Leaderboards extends _Score.Leaderboards {}
        export interface BeatmapUserScore extends _Score.BeatmapUserScore {}
        export interface BeatmapScores extends _Score.BeatmapScores {}
    }
}