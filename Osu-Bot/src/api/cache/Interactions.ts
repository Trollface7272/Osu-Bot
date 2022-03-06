import { Collection } from "discord.js";

class _InteractionCache {
    private cache: Collection<string, any>

    constructor() { this.cache = new Collection() }

    public LookUp(id: string) {
        return this.cache.get(id)
    }
    public Add(id: string, data: any) {
        this.cache.set(id, {...data, id})
    }
}

export const InteractionCache = new _InteractionCache()