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

        constructor(id: number, secret: string, scopes: string) {
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

        public async FetchToken() {
            const res = await axios.post(this.tokenUrl, {
                client_id: this.id,
                client_secret: this.secret,
                scope: this.scopes,
                grant_type: this.grantType
            })
            const data = res.data
            this.tokenType = data.token_type
            this.accessToken = data.access_token
            this.expires = new Date(Date.now() + data.expires_in)
            return `${this.tokenType} ${this.accessToken}`
        }
    }
    export class AuthCode {
        private tokenUrl: string
        private id: number
        private secret: string
        private scopes: string
        private grantType: string
        private tokenType: string
        private accessToken: string
        private expires: Date

        constructor(id: number, secret: string, scopes: string) {
            this.id = id
            this.secret = secret
            this.scopes = scopes
            this.expires = new Date(0)
            this.grantType = "client_credentials"
        }

        public async FetchToken() {
            const res = await axios.post(this.tokenUrl, {
                client_id: this.id,
                client_secret: this.secret,
                scope: this.scopes,
                grant_type: this.grantType
            })
            const data = res.data
            this.tokenType = data.token_type
            this.accessToken = data.access_token
            this.expires = new Date(Date.now() + data.expires_in)
            return `${this.tokenType} ${this.accessToken}`
        }
    }
    export class User {
        private tokenUrl: string
        private id: number
        private secret: string
        private scopes: string
        private tokenType: string
        private accessToken: string
        private expires: Date
        private refreshToken: string

        constructor(id: number, secret: string, scopes: string, tokenType: string, refreshToken: string, accessToken: string, expires: Date) {
            this.id = id
            this.secret = secret
            this.scopes = scopes
            this.expires = expires
            this.accessToken = accessToken
            this.refreshToken = refreshToken
            this.tokenType = tokenType
        }

        public async GetToken() {
            if (new Date() > this.expires) return await this.RefreshToken()
            return `${this.tokenType} ${this.accessToken}`
        }

        public async RefreshToken() {
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
            this.expires = new Date(Date.now() + data.expires_in)
        }
    }
}
export class OAuth2Manager {
    private id: number
    private secret: string
    private scopes: string
    private clientCredentials: OAuth2.ClientCredentials
    private users: { [key: string]: OAuth2.User }
    constructor(id: number, secret: string, scopes: string) {
        this.id = id
        this.secret = secret
        this.scopes = scopes
        this.users = {}
        this.clientCredentials = new OAuth2.ClientCredentials(this.id, this.secret, this.scopes)
    }

    public get ClientCredentials() {
        return this.clientCredentials
    }

    public UserCredentials(cacheId: string, id: number, secret: string, scopes: string, tokenType: string, refreshToken: string, accessToken: string, expires: Date) {
        const user = new OAuth2.User(id, secret, scopes, tokenType, refreshToken, accessToken, expires)
        this.users[cacheId] = user
        return user
    }

    public GetCached(cacheId: string) {
        return this.users[cacheId]
    }
}