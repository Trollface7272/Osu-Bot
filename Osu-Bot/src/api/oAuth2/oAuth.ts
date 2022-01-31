import axios from "axios"

export namespace OAuth2 {
    export class ClientCredentials {
        private tokenUrl: string
        private id: number
        private secret: string
        private scopes: string
        private grantType: string
        private tokenType: string
        private accessToken: string
        private expires: Date

        constructor(tokenUrl: string, id: number, secret: string, scopes: string) {
            this.tokenUrl = tokenUrl
            this.id = id
            this.secret = secret
            this.scopes = scopes
            this.expires = new Date(0)
            this.grantType = "client_credentials"
        }

        public async GetToken() {
            if (new Date() > this.expires) return await this.FetchToken()
            return `${this.tokenType} ${this.accessToken}`
        }

        private async FetchToken() {
            const res = await axios.post(this.tokenUrl, {
                client_id: this.id,
                client_secret: this.secret,
                scope: this.scopes,
                grant_type: this.grantType
            })
            const data = res.data
            this.tokenType = data.token_type
            this.accessToken = data.access_token
            this.expires = new Date(Date.now() + data.expires_in * 1000)
            return `${this.tokenType} ${this.accessToken}`
        }
    }
    export class AuthCode {
        private tokenUrl: string
        private cacheId: string
        private id: number
        private secret: string
        private scopes: string
        private tokenType: string
        private accessToken: string
        private expires: Date
        private refreshToken: string
        private code: string
        private reddirectUri: string
        private refreshCallback: ((a,b,c,d,e,f) => Promise<any>)

        constructor(cacheId: string, tokenUrl: string, id: number, secret: string, scopes: string, code: string, reddirectUri: string, refreshCallback: ((a,b,c,d,e,f) => Promise<any>)) {
            this.tokenUrl = tokenUrl
            this.cacheId = cacheId
            this.id = id
            this.secret = secret
            this.scopes = scopes
            this.code = code
            this.reddirectUri = reddirectUri
            this.refreshCallback = refreshCallback
        }

        public async GetToken() {
            if (!this.refreshToken) return this.FetchToken()
            if (new Date() > this.expires) return await this.RefreshToken()
            return `${this.tokenType} ${this.accessToken}`
        }

        private async RefreshToken() {
            const res = await axios.post(this.tokenUrl, {
                client_id: this.id,
                client_secret: this.secret,
                refresh_token: this.refreshToken,
                scope: this.scopes,
                grant_type: "refresh_token"
            })
            const data = res.data
            this.accessToken = data.access_token
            this.tokenType = data.tokenType
            this.refreshToken = data.refresh_token
            this.expires = new Date(Date.now() + data.expires_in * 1000)
            this.refreshCallback(this.cacheId, this.accessToken, this.tokenType, this.refreshToken, this.expires, this.scopes).catch(err => console.error(err))
        }

        private async FetchToken() {
            const res = await axios.post(this.tokenUrl, {
                client_id: this.id,
                client_secret: this.secret,
                code: this.code,
                scope: this.scopes,
                redirect_uri: this.reddirectUri,
                grant_type: "authorization_code"
            })
            const data = res.data
            this.accessToken = data.access_token
            this.tokenType = data.tokenType
            this.refreshToken = data.refresh_token
            this.expires = new Date(Date.now() + data.expires_in * 1000)
        }
    }
    export class User {
        private tokenUrl: string
        private cacheId: string
        private id: number
        private secret: string
        private scopes: string
        private tokenType: string
        private accessToken: string
        private expires: Date
        private refreshToken: string
        private refreshCallback: ((a,b,c,d,e,f) => Promise<any>)

        constructor(cacheId: string, tokenUrl: string, id: number, secret: string, scopes: string, tokenType: string, refreshToken: string, accessToken: string, expires: Date, refreshCallback: ((a,b,c,d,e,f) => Promise<any>)) {
            this.tokenUrl = tokenUrl
            this.cacheId = cacheId
            this.id = id
            this.secret = secret
            this.scopes = scopes
            this.expires = expires
            this.accessToken = accessToken
            this.refreshToken = refreshToken
            this.tokenType = tokenType
            this.refreshCallback = refreshCallback
        }

        public async GetToken() {
            if (new Date() > this.expires) return await this.RefreshToken()
            return `${this.tokenType} ${this.accessToken}`
        }

        private async RefreshToken() {
            const res = await axios.post(this.tokenUrl, {
                client_id: this.id,
                client_secret: this.secret,
                refresh_token: this.refreshToken,
                scope: this.scopes,
                grant_type: "refresh_token"
            })
            const data = res.data
            this.accessToken = data.access_token
            this.tokenType = data.token_type
            this.refreshToken = data.refresh_token
            this.expires = new Date(Date.now() + data.expires_in * 1000)
            this.refreshCallback(this.cacheId, this.accessToken, this.tokenType, this.refreshToken, this.expires, this.scopes).catch(err => console.error(err))
            return `${this.tokenType} ${this.accessToken}`
        }
    }
}
export class OAuth2Manager {
    private id: number
    private secret: string
    private scopes: string
    private clientCredentials: OAuth2.ClientCredentials
    private tokenUrl: string
    private users: { [key: string]: OAuth2.User }
    constructor(id: number, secret: string, scopes: string, tokenUrl: string) {
        this.id = id
        this.secret = secret
        this.scopes = scopes
        this.users = {}
        this.tokenUrl = tokenUrl
        this.clientCredentials = new OAuth2.ClientCredentials(this.tokenUrl, this.id, this.secret, this.scopes)
    }

    public get ClientCredentials() {
        return this.clientCredentials
    }

    public UserCredentials(cacheId: string, scopes: string, tokenType: string, refreshToken: string, accessToken: string, expires: Date, refreshCallback: ((a,b,c,d,e,f) => Promise<any>)) {
        const user = new OAuth2.User(cacheId, this.tokenUrl, this.id, this.secret, scopes, tokenType, refreshToken, accessToken, expires, refreshCallback)
        this.users[cacheId] = user
        return user
    }

    public AuthCode(cacheId: string, scopes: string, code: string, reddirectUri: string, refreshCallback: ((a,b,c,d,e,f) => Promise<any>)) {
        const user = new OAuth2.AuthCode(cacheId, this.tokenUrl, this.id, this.secret, scopes, code, reddirectUri, refreshCallback)
        this.users[cacheId] = user as unknown as OAuth2.User
        return user
    }

    public GetCached(cacheId: string) {
        return this.users[cacheId]
    }
}