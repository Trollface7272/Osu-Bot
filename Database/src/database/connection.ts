import { connect } from "mongoose"
import logger from "../functions/logger"



export const Connect = async () => {
    logger.Info(`Connecting to database`)
    await connect(process.env.MONGO, {
        keepAlive: true
    })
    logger.Info(`Connected to database`)    
}