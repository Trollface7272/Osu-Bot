import { HandlePromise } from "@functions/utils"
import { v2ApiLink } from "@osuapi/consts"
import { Utils } from "@osuapi/functions"
import { OAuth2Manager } from "api/oAuth2/oAuth"

export namespace News {

    export class NewsPostRaw {
        public author: string
        public edit_url: string
        public first_image: string
        public id: number
        public published_at: string
        public slug: string
        public title: string
        public updated_at: string
        public content: string
        public navigation: { Newer: NewsPostRaw, Older: NewsPostRaw }
        public preview: string
    }

    export class NewsPost {
        private raw: NewsPostRaw

        public get Author() { return this.raw.author }
        public get EditUrl() { return this.raw.edit_url }
        public get FirstImage() { return this.raw.first_image }
        public get id() { return this.raw.id }
        public get PublishedDate() { return new Date(this.raw.published_at) }
        public get Slug() { return this.raw.slug }
        public get Title() { return this.raw.title }
        public get LastUpdated() { return new Date(this.raw.updated_at) }
        public get Content() { return this.raw.content }
        public get Navigation() { return this.raw.navigation }
        public get Preview() { return this.raw.preview }

        constructor(post: NewsPostRaw) {
            this.raw = post
        }
    }

    export class NewsRaw {
        public cursor: Object
        public news_posts: NewsPostRaw[]
        public news_sidebar: { current_year: number, news_posts: NewsPostRaw[], years: number[] }
        public search: { limit: number, sort: string }
    }

    export class News {
        private raw: NewsRaw
        private posts: NewsPost[]

        public get Cursor() { return this.raw.cursor }
        public get Posts() { return this.posts }
        public get NewsSidebar() { return this.raw.news_sidebar }
        public get Search() { return this.raw.search }

        constructor(raw: NewsRaw) {
            this.raw = raw
            this.posts = raw.news_posts.map(p => new NewsPost(p))
        }
    }

    export class Api {
        private OAuth: OAuth2Manager
        constructor(a: OAuth2Manager) { this.OAuth = a }

        public async GetNews({ limit = 3 }: { limit?: number }) {
            const endpoint = `${v2ApiLink}/news`
            const [news, err] = await HandlePromise<NewsRaw>(Utils.Get(endpoint, { limit }))
            if (err) Utils.Error(err, endpoint)
            return new News(news)
        }
    }
}