declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD: string
            SECRET: string
            OSUURL: string
            OSU: string
            OSUID: number
            NODE_ENV: string
            OSU_PERFORMANCE_PATH: string
            REDDITID: number
            REDDIT: string
        }
    }
}

export {}