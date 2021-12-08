import { iUserAccountHistoryRaw, iUserAchievementRaw, iUserBannerRaw, iUserCountryRaw, iUserMonthlyPlaycountRaw, iUserPageRaw, iUserRankHistoryRaw, iUserRaw, iUserReplaysWatchedRaw } from "../types/profile"
import { GameModes, v2ApiLink } from "../consts"
import { GameMode, ProfilePage } from "../types/api_enums"
import { Get, HandlePromise } from "../functions"
import logger from "@functions/logger"
import { AxiosError } from "axios"
import { Errors, OsuApiError } from "@osuapi/error"

class ApiResponse {
    public avatar_url: string
    public country_code: string
    public country: iUserCountryRaw
    public default_group: string
    public id: number
    public is_bot: boolean
    public is_active: boolean
    public is_deleted: boolean
    public is_online: boolean
    public is_supporter: boolean
    public is_restricted?: boolean
    public last_visit: Date | null
    public pm_friends_only: boolean
    public profile_colour: string
    public username: string
    public cover_url: string
    public discord: string | null
    public interests: string | null
    public location: string | null
    public twitter: string | null
    public website: string | null
    public occupation: string | null
    public has_supported: boolean
    public join_date: Date
    public kudosu: { total: number, available: number }
    public max_blocks: number
    public max_friends: number
    public playmode: GameMode
    public playstyle: string[]
    public post_count: number
    public profile_order: ProfilePage[]
    public title: string | null
    public title_url: string | null
    //TODO
    public account_history: iUserAccountHistoryRaw[]
    public active_tournament_banner: iUserBannerRaw|null
    //TODO
    public badges: unknown[]
    public beatmap_playcounts_count: number
    public blocks: unknown|undefined
    //TODO
    public cover: unknown
    public favourite_beatmapset_count: number
    public follower_count: number
    public friends: unknown[]|undefined
    public graveyard_beatmapset_count: number
    public groups: unknown[]
    public loved_beatmapset_count: number
    public monthly_playcounts: iUserMonthlyPlaycountRaw[]
    public page: iUserPageRaw
    public pending_beatmapset_count: number
    public previous_usernames: string[]
    public rank_history: iUserRankHistoryRaw
    public ranked_beatmapset_count: number
    public replays_watched_counts: iUserReplaysWatchedRaw[]
    public scores_best_count: number
    public scores_first_count: number
    public scores_recent_count: number
    //TODO
    public statistics: unknown
    //TODO
    public statistics_rulesets: unknown
    public support_level: 0|1|2|3
    public unread_pm_count: number
    public user_achievements: iUserAchievementRaw[]
    //TODO
    public user_preferences: unknown
}

export class OsuProfile {
    public raw: ApiResponse






    public get Avatar() { return this.raw.avatar_url }
    public get Country() { return {
        code: this.raw.country_code,
        name: this.raw.country.name
    } }
    public get Group() { return this.raw.default_group }
    public get id() { return this.raw.id }
    public get is() { return {
        bot: this.raw.is_bot,
        restricted: this.raw.is_restricted,
        deleted: this.raw.is_deleted,
        supporter: this.raw.is_supporter,
        online: this.raw.is_online,
        active: this.raw.is_active,
        
    }}
    public get LastVisit() { return this.raw.last_visit }
    public get PmFriendsOnly() { return this.raw.pm_friends_only }
    public get ProfileColor() { return this.raw.profile_colour }
    public get Username() { return this.raw.username }
    public get Cover() { return this.raw.cover_url }
    public get Discord() { return this.raw.discord }
    public get Interests() { return this.raw.interests }
    public get Location() { return this.raw.location }
    public get Twitter() { return this.raw.twitter }
    public get Website() { return this.raw.website }
    public get Occupation() { return this.raw.occupation }
    public get HadSupporter() { return this.raw.has_supported }
    public get JoinDate() { return this.raw.join_date }
    public get Kudosu() { return this.raw.kudosu }
    public get MaxBlocks() { return this.raw.max_blocks }
    public get MaxFriends() { return this.raw.max_friends }
    public get MainMode() { return this.raw.playmode }
    public get PlayStyle() { return this.raw.playstyle }
    public get PostCount() { return this.raw.post_count }
    public get ProfileOrder() { return this.raw.profile_order }
    public get Title() { return this.raw.title }
    public get TitleUrl() { return this.raw.title_url }
    public get AccountHistory() { return this.raw.account_history}
    public get Badges() { return this.raw.badges}
    public get PlayedBeatmaps() { return this.raw.beatmap_playcounts_count}
    public get Blocks() { return this.raw.blocks}
    public get FavouriteBeatmaps() { return this.raw.favourite_beatmapset_count}
    public get Followers() { return this.raw.follower_count}
    public get Friends() { return this.raw.friends}
    public get GraveyardBeatmaps() { return this.raw.graveyard_beatmapset_count}
    public get Groups() { return this.raw.groups}
    public get LovedBeatmaps() { return this.raw.loved_beatmapset_count}
    public get MonthlyPlaycounts() { return this.raw.monthly_playcounts}
    public get Page() { return this.raw.page}
    public get PendingBeatmaps() { return this.raw.pending_beatmapset_count}
    public get PreviousUsernames() { return this.raw.previous_usernames}
    public get RankHistory() { return this.raw.rank_history}
    public get RankedBeatmaps() { return this.raw.ranked_beatmapset_count}
    public get ReplaysWatched() { return this.raw.replays_watched_counts}
    public get TopPlays() { return this.raw.scores_best_count}
    public get FirstPlaces() { return this.raw.scores_first_count}
    public get RecentScores() { return this.raw.scores_recent_count}
    public get SupportLevel() { return this.raw.support_level}
    public get UnreadPmCount() { return this.raw.unread_pm_count}
    public get UserAchievements() { return this.raw.user_achievements}


    constructor(data: iUserRaw) {
        const {
            avatar_url, country_code, default_group, is_bot, is_active, is_deleted, is_online, is_supporter, is_restricted, last_visit, cover_url, has_supported, id, join_date, kudosu, max_blocks, max_friends, playmode, playstyle, pm_friends_only, post_count, profile_colour, profile_order, username, country, discord, interests, location, occupation, title, title_url, twitter, website, account_history, active_tournament_banner, badges, beatmap_playcounts_count, blocks, cover, favourite_beatmapset_count, follower_count, friends, graveyard_beatmapset_count, groups, loved_beatmapset_count, monthly_playcounts, page, pending_beatmapset_count, previous_usernames, rank_history, ranked_beatmapset_count, replays_watched_counts, scores_best_count, scores_first_count, scores_recent_count, statistics, statistics_rulesets, support_level, unread_pm_count, user_achievements, user_preferences
        } = data
        const d = {
            avatar_url, country_code, default_group, is_bot, is_active, is_deleted, is_online, is_supporter, is_restricted, last_visit: new Date(last_visit || 0), cover_url, has_supported, id, join_date: new Date(join_date || 0), kudosu, max_blocks, max_friends, playmode, playstyle, pm_friends_only, post_count, profile_colour, profile_order, username, country, discord, interests, location, occupation, title, title_url, twitter, website,account_history, active_tournament_banner, badges, beatmap_playcounts_count, blocks, cover, favourite_beatmapset_count, follower_count, friends, graveyard_beatmapset_count, groups, loved_beatmapset_count, monthly_playcounts, page, pending_beatmapset_count, previous_usernames, rank_history, ranked_beatmapset_count, replays_watched_counts, scores_best_count, scores_first_count, scores_recent_count, statistics, statistics_rulesets, support_level, unread_pm_count, user_achievements, user_preferences
        }
        this.raw = d
    }
}

interface apiOptions {
    id?: string, mode?: 0 | 1 | 2 | 3, token?: string, self?: boolean
}
class ApiProfile {
    private Token: string
    constructor(key: string) {
        this.Token = key
    }

    public async FromId({id, mode, token, self}: apiOptions) {
        const gamemode = mode != undefined ? "/" + GameModes[mode] : ""
        const endpoint = self ?
            `${v2ApiLink}/me${gamemode}` : 
            `${v2ApiLink}/users/${id}${gamemode}`
        console.log(endpoint)        
        const [data, err]: [iUserRaw, AxiosError] = await HandlePromise<iUserRaw>(Get(endpoint, {}, { Authorization: token || this.Token }))
        if (err) {
            if (err.response.status == 403) throw new OsuApiError(Errors.BadToken)
            if (err.response.status == 404) throw new OsuApiError(Errors.WrongEndpoint)
            throw new OsuApiError(Errors.Unknown)
        }
        if (!data) throw new OsuApiError(Errors.PlayerDoesNotExist)
        return new OsuProfile(data)
    }
}

export default ApiProfile