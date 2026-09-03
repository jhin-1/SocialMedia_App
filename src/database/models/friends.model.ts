import mongoose from "mongoose";
import { friendsInterface } from "../../common/interfaces";


const FriendsSchema = new mongoose.Schema<friendsInterface>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
},
    {
        timestamps: true,
        strictQuery: true, // Enable strict query mode to prevent querying with fields not defined in the schema
    })

const friendsModel = mongoose.model<friendsInterface>("Friends", FriendsSchema)
export default friendsModel;