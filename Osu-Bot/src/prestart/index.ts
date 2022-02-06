import 'module-alias/register'

import { config } from "dotenv";

String.prototype.isNumber = function (this: string) {
    return /^\d+$/.test(this)
}

config() 