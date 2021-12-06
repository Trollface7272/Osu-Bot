import 'module-alias/register'

import { config } from "dotenv"

import Client from "@bot/client"

config()

new Client().Start(process.env.DISCORD)