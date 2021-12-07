export enum Errors {
    BadToken,
    WrongEndpoint,
    PlayerDoesNotExist,
    Unknown
}

export class OsuApiError {
    public code: Errors
    constructor(code: Errors) { this.code = code }
}