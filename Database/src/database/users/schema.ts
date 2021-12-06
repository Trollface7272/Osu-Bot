import { model, Schema } from "mongoose";


export const UserSchema = new Schema({
    _id: String,
    name: String,
    messages: Number,
    commands: Number,
    osu: { token: String, refresh: String, name: String, expireDate: Date, tokenType: String }
})
export const UserModel = model("user", UserSchema)