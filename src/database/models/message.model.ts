import mongoose from "mongoose";
import { messageInterface } from "../../common/interfaces/message.interface";



const MessageSchema = new mongoose.Schema<messageInterface>({
    senderId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
    },
    roomId: {
        type: String,
    },
    deletedAt: {
        type: Date,
    }
},
    {
        timestamps: true,
        strictQuery: true, // Enable strict query mode to prevent querying with fields not defined in the schema
    })

const MessageModel = mongoose.model<messageInterface>("Message", MessageSchema)
export default MessageModel;