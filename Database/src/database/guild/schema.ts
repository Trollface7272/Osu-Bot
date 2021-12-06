import { Schema } from "mongoose";


export const GuildSchema = new Schema({
    _id: String,
    name: String,
    prefix: String,
    messages: Number,
    commands: Number
})