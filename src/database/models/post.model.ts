import mongoose from "mongoose";
import { IPost } from "../../common/interfaces";
import { Visibility } from "../../common/enums";




const PostSchema = new mongoose.Schema<IPost>({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    content:{
        type:String,
    },

    attachments:[{
        type:String,
        required: function(this){ // if content is empty, attachments must be provided
        if(this.content.length == 0){
            throw new Error("Content cannot be empty")
        }
        }
    }], 

    tags:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    // likes:[{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User"
    // }],

    visibility:{
        type: String,
        default: Visibility.PUBLIC,
    },
    
    deletedAt:{
        type:Date,
    },

    restoredAt:{
        type:Date,
    }
},
{
    timestamps: true,
    strictQuery: true, // Enable strict query mode to prevent querying with fields not defined in the schema
})

PostSchema.pre(["find", "findOne", "findOneAndUpdate"], async function(){
    let qurey = this.getQuery();
    let {admin} = qurey;
    if(!admin){
        this.setQuery({...qurey, deletedAt: {$exists: false}})
    }
})

const PostModel = mongoose.model<IPost>("Post", PostSchema);

export default PostModel;