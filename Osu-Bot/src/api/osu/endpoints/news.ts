import { v2ApiLink } from "@osuapi/consts"
import { Get, SilentGet } from "@osuapi/functions"

export class OsuNewsPostRaw {
    public author: string
    public edit_url: string
    public first_image: string
    public id: number
    public published_at: string
    public slug: string
    public title: string
    public updated_at: string
    public content: string
    public navigation: { Newer: OsuNewsPostRaw, Older: OsuNewsPostRaw }
    public preview: string
}

export class OsuNewsPost {
    private raw: OsuNewsPostRaw

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

    constructor(post: OsuNewsPostRaw) {
        this.raw = post
    }
}

export class OsuNewsRaw {
    public cursor: Object
    public news_posts: OsuNewsPostRaw[]
    public news_sidebar: { current_year: number, news_posts: OsuNewsPostRaw[], years: number[] }
    public search: { limit: number, sort: string }
}

export class OsuNews {
    private raw: OsuNewsRaw
    private posts: OsuNewsPost[]

    public get Cursor() { return this.raw.cursor }
    public get Posts() { return this.posts }
    public get NewsSidebar() { return this.raw.news_sidebar }
    public get Search() { return this.raw.search }

    constructor(raw: OsuNewsRaw) {
        this.raw = raw
        this.posts = raw.news_posts.map(p => new OsuNewsPost(p))
    }
}

interface GetListingOptions {
    token?: string
    limit?: number
    silent?: boolean
}

class ApiNews {
    private Token: string

    constructor(token: string) {
        this.Token = token
    }

    public async GetNews({ token, limit=3, silent=false }: GetListingOptions) {
        const endpoint = `${v2ApiLink}/news`
        const news = await (silent? SilentGet : Get)(endpoint, {limit})
        return new OsuNews(news)
        
    }
}

export default ApiNews