import {Icomment} from "../../common/interfaces"
import mongoose from "mongoose"


const commentSchema = new mongoose.Schema<Icomment>({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "User",
        require: true
    },
    comment:{
        type:String,
        require:true
    },
    postId:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Post",
        require:true,
    },
    deletedAt:{
        type:Date,
    },  
    

},
{
    timestamps:true,
    strictQuery: true
})