import app from "./app"
import { config } from "dotenv"
import { Connect } from "./database/connection"
config()
Connect()

app.listen(process.env.PORT || 8080)