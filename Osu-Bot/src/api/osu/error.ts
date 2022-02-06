export enum Errors {
    BadToken,
    WrongEndpoint,
    PlayerDoesNotExist,
    BeatmapDoesNotExist,
    Unknown,
    InvalidOsuApp,
    InvalidId
}

export class OsuApiError {
    public code: Errors
    public message: any
    public toString() {
        return this.message
    }
    constructor(code: Errors, message: any) { this.code = code, this.message = message }
}