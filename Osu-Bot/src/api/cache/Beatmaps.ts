import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const cachePath = join(__dirname, "..", "..", "..", "cache")
const beatmapPath = join(__dirname, "..", "..", "..", "cache", "beatmaps")
const beatmapsetPath = join(__dirname, "..", "..", "..", "cache", "beatmapsets")

if (!existsSync(cachePath))
    mkdirSync(cachePath)
if (!existsSync(beatmapPath))
    mkdirSync(beatmapPath)
if (!existsSync(beatmapsetPath))
    mkdirSync(beatmapsetPath)

class _BeatmapCache {
    private memoryCache = {
        beatmap: [],
        set: []
    }
}


export const BeatmapCache = new _BeatmapCache()