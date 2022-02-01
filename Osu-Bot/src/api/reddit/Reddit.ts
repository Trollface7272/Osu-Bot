import { OAuth2Manager } from "../oAuth2/oAuth"

class _RedditApi {
    public oAuth: OAuth2Manager
    constructor(id: number, secret: string, scopes: string, tokenUrl: string) {
        this.oAuth = new OAuth2Manager(id, secret, scopes, tokenUrl)
    }
}


//export const RedditApi = new _RedditApi(process.env.REDDITID, process.env.REDDIT, "*", "https://www.reddit.com/api/v1/access_token") 