import { connect, connection } from "mongoose"
import { disconnect } from "process"
import logger from "../functions/logger"



export const Connect = async () => {
    connection.on("disconnected", () => {
        logger.Log(`Disconnected from database`)
        Connect()
    })

    connection.on('error', (error: string) => {
        logger.Log('Error in MongoDb connection: ' + error)
        disconnect()
    })

    connection.on('reconnected', function () {
        logger.Log('Reconnected to database');
    })

    connection.on('connected', () => logger.Log('Connected to database'))

    connection.once("open", () => logger.Log(`Opened connection to database`))

    connection.on("connecting", () => logger.Log(`Connecting to database`))

    await connect(process.env.MONGO, {
        keepAlive: true
    })
}