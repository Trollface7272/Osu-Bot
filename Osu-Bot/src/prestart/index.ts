import 'module-alias/register'

import { config } from "dotenv";

String.prototype.isNumber = function (this: string) {
    return /^\d+$/.test(this)
}
Number.prototype.roundFixed = function (this: number, digits: number) {
    return Math.round(this * Math.pow(10, digits)) / Math.pow(10, digits)
}
Date.prototype.toDiscordToolTip = function (this: Date) {
    return `<t:${Math.floor(this.getTime()/1000)}:R>`
}

config() 