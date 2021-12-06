import express from "express"
import morgan from "morgan";
import {router} from "./routes/router"
import bodyParser from "body-parser"



const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(morgan("dev"))

app.use(router)

export default app