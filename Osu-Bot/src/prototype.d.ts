declare global {
    interface String {
        isNumber(): boolean
    }
    interface Number {
        roundFixed(digits: number): number
    }
    interface Date {
        toDiscordToolTip(): string
    }
}

export {}