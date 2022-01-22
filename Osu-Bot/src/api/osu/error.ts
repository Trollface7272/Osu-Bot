export enum Errors {
    BadToken,
    WrongEndpoint,
    PlayerDoesNotExist,
    BeatmapDoesNotExist,
    Unknown,
    InvalidOsuApp
}

export class OsuApiError {
    public code: Errors
    public message: any
    constructor(code: Errors, message: any) { this.code = code, this.message = message }
}