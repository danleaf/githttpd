import * as mongoose from "mongoose";

export interface User {
    username: string;
    password: string;
}

let userSchema = new mongoose.Schema({
    username: {
        type: String, unique: true
    },
    password: String
});

interface UserDoc extends mongoose.Document, User {
    encode(): any;
}

userSchema.methods.encode = function () { };

interface UserModel extends mongoose.Model<UserDoc>  {
    lalala(): any;
}

userSchema.statics.lalala = function () { };


export let userModel = <UserModel>mongoose.model('user', userSchema.index({ 'username': 1 }));
