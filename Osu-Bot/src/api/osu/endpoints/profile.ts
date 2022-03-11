import { GameModes, v2ApiLink } from "../consts"
import { Utils } from "../functions"
import logger from "@functions/logger"
import { AxiosError } from "axios"
import { Errors, OsuApiError } from "@osuapi/error"
import { OAuth2Manager } from "api/oAuth2/oAuth"
import { ResponseTypes } from "@osuapi/response_types/ResponseTypes"


export namespace Profile {
    export class Compact {
        public raw: ResponseTypes.User.Compact

        public get AvatarUrl() { return this.raw.avatar_url }
        public get CountryCode() { return this.raw.country_code }
        public get DefaultGroup() { return this.raw.default_group }
        public get Id() { return this.raw.id }
        public get Is() { return { bot: this.raw.is_bot, active: this.raw.is_active, deleted: this.raw.is_deleted, online: this.raw.is_online, supporter: this.raw.is_supporter } }
        public get LastOnline() { return new Date(this.raw.last_visit) }
        public get PmFriendsOnly() { return this.raw.pm_friends_only }
        public get ProfileColor() { return this.raw.profile_colour }
        public get Username() { return this.raw.username }
        public get ProfileUrl() { return "https://osu.ppy.sh/user/" + this.raw.id }
        public get Flag() { return `https://flagcdn.com/w80/${this.raw.country_code.toLowerCase()}.png` }

        constructor(raw: ResponseTypes.User.Compact) { this.raw = raw }
    }
    export class Base extends Compact {
        declare public raw: ResponseTypes.User.Base

        public get CoverUrl() { return this.raw.cover_url }
        public get Discord() { return this.raw.discord }
        public get HasSupported() { return this.raw.has_supported }
        public get Interests() { return this.raw.interests }
        public get JoinDate() { return new Date(this.raw.join_date) }
        public get Kudosu() { return this.raw.kudosu }
        public get Location() { return this.raw.location }
        public get MaxBlocks() { return this.raw.max_blocks }
        public get MaxFriends() { return this.raw.max_friends }
        public get Occupation() { return this.raw.occupation }
        public get Playmode() { return this.raw.playmode }
        public get Playstyle() { return this.raw.playstyle }
        public get PostCount() { return this.raw.post_count }
        public get ProfileOrder() { return this.raw.profile_order }
        public get Title() { return this.raw.title }
        public get TitleUrl() { return this.raw.title_url }
        public get Twitter() { return this.raw.twitter }
        public get Website() { return this.raw.website }
        public get Country() { return { code: this.raw.country_code, name: this.raw.country.name, flag: `https://flagcdn.com/w80/${this.raw.country_code.toLowerCase()}.png` } }
        public get Cover() { return this.raw.cover }

        constructor(raw: ResponseTypes.User.Base) { super(raw); this.raw = raw }
    }
    export class FromId extends Base {
        declare public raw: ResponseTypes.User.FromId

        public get History() { return this.raw.account_history }
        public get Banner() { return this.raw.active_tournament_banner }
        public get Badges() { return this.raw.badges }
        public get PlayedMapsCount() { return this.raw.beatmap_playcounts_count }
        public get FavouriteMapCount() { return this.raw.favourite_beatmapset_count }
        public get FollowerCount() { return this.raw.follower_count }
        public get GraveyardedMapCount() { return this.raw.graveyard_beatmapset_count }
        public get Groups() { return this.raw.groups }
        public get LovedMapCount() { return this.raw.loved_beatmapset_count }
        public get MappingFollowers() { return this.raw.mapping_follower_count }
        public get MonthlyPlaycounts() { return this.raw.monthly_playcounts }
        public get Page() { return this.raw.page }
        public get PendingMapsCount() { return this.raw.pending_beatmapset_count }
        public get PreviousUsernames() { return this.raw.previous_usernames }
        public get RankHistory() { return this.raw.rank_history }
        public get RankedMapsCount() { return this.raw.ranked_beatmapset_count }
        public get WatchedReplays() { return this.raw.replays_watched_counts }
        public get TopScoreCount() { return this.raw.scores_best_count }
        public get Rank1ScoresCount() { return this.raw.scores_first_count }
        public get RecentScoresCount() { return this.raw.scores_recent_count }
        public get Statistics() { return this.raw.statistics }
        public get SupportLevel() { return this.raw.support_level }
        public get UserAchievements() { return this.raw.user_achievements }
        public get Score() { return { Ranked: this.raw.statistics.ranked_score, Total: this.raw.statistics.total_score, Hits: this.raw.statistics.total_hits } }
        public get Rank() { return { Global: this.raw.statistics.global_rank, Country: this.raw.statistics.country_rank } }
        public get Level() { return { Current: this.raw.statistics.level.current, Progress: this.raw.statistics.level.progress } }
        public get Performance() { return this.raw.statistics.pp }
        public get Grades() { return { s: this.raw.statistics.grade_counts.s, a: this.raw.statistics.grade_counts.a, sh: this.raw.statistics.grade_counts.sh, ss: this.raw.statistics.grade_counts.ss, ssh: this.raw.statistics.grade_counts.ssh, } }
        public get Accuracy() { return this.raw.statistics.hit_accuracy }
        public get PlayCount() { return this.raw.statistics.play_count }
        public get MaxCombo() { return this.raw.statistics.maximum_combo }
        public get ReplayViews() { return this.raw.statistics.replays_watched_by_others }
        public get PlayTime() { return this.raw.statistics.play_time }



        constructor(raw: ResponseTypes.User.FromId) { super(raw); this.raw = raw }
    }
    export class Self extends FromId {
        declare public raw: ResponseTypes.User.Self

        public get Is() { return { bot: this.raw.is_bot, active: this.raw.is_active, deleted: this.raw.is_deleted, online: this.raw.is_online, supporter: this.raw.is_supporter, restricted: this.raw.is_restricted } }
        public get Friends() { return this.raw.friends }
        public get StatisticsRulesets() { return this.raw.statistics_rulesets }
        public get UnreadPmCount() { return this.raw.unread_pm_count }
        public get UserPreferences() { return this.raw.user_preferences }

        constructor(raw: ResponseTypes.User.Self) { super(raw); this.raw = raw }
    }

    interface apiOptions {
        id?: number|string, mode?: 0 | 1 | 2 | 3, self?: boolean, OAuthId?: string
    }


    export class Api {
        private OAuth: OAuth2Manager
        constructor(a: OAuth2Manager) { this.OAuth = a }

        private async Get<T>(endpoint: string, OAuthId: string) {
            const [data, err]: [T, AxiosError] = await Utils.HandlePromise<T>(Utils.Get(endpoint, {}, { Authorization: await Utils.GetUserToken(this.OAuth, OAuthId) }, {}))
            if (err) Utils.Error(err, endpoint)

            if (!data) throw new OsuApiError(Errors.PlayerDoesNotExist, "Player not found")

            return data
        }

        public async Self({ OAuthId, mode }) {
            const gamemode = (mode != undefined) ? ("/" + GameModes[mode]) : ""

            const endpoint = `${v2ApiLink}/me${gamemode}`

            const data = await this.Get<ResponseTypes.User.Self>(endpoint, OAuthId)

            return new Self(data)
        }

        public async FromId({ id, mode, self, OAuthId }: apiOptions) {
            if (!id) return
            if (self) return this.Self({ OAuthId, mode })
            const gamemode = (mode != undefined) ? ("/" + GameModes[mode]) : ""

            const endpoint = `${v2ApiLink}/users/${id.toString().replaceAll("_", "%20")}${gamemode}`

            const data = await this.Get<ResponseTypes.User.FromId>(endpoint, OAuthId)

            return new FromId(data)
        }
    }
}