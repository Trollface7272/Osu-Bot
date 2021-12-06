import { connect } from "mongoose"



export const Connect = async () => {
    console.log(`Connecting to database`)
    await connect(process.env.MONGO, {
        keepAlive: true
    })
    console.log(`Connected to database`)    
}