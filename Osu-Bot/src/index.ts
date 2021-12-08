import 'module-alias/register'

import { config } from "dotenv"

import Client from "@bot/client"

config()

export const client = new Client()
client.Start(process.env.DISCORD)