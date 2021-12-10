




interface bestParams {
    id: string, mode?: 0|1|2|3, token?: string, self: string
}
class ApiScore {
    private token: string
    constructor(token: string) { this.token = token }

    public static GetBest({id, mode, token}) {

    }
}