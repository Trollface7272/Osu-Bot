import 'module-alias/register'

import "./prestart/index"

import Client from "@bot/client"



export const client = new Client()
client.Start(process.env.DISCORD)