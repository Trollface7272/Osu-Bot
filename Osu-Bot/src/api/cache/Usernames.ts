import logger from "@functions/logger";

class Username {
    public username: string
    public id: number

    constructor(username: string, id: number) { this.username = username; this.id = id }
}

class _UsernameCache {
    private cache: Username[]

    constructor() { this.cache = [] }

    public LookUp(username: string) {
        return this.cache.find(e => e.username === username)?.id
    }
    public Add(username: string, id: number) {
        if (this.LookUp(username)) return
        logger.Debug(`Caching -> ${username}`)
        this.cache.push({username, id})
    }
}

export const UsernameCache = new _UsernameCache()