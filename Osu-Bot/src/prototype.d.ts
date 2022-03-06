declare global {
    interface String {
        isNumber(): boolean
    }
    interface Number {
        roundFixed(digits: number): string
    }
    interface Date {
        toDiscordToolTip(): string
    }
}

export {}