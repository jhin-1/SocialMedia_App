import { Types } from "mongoose";


export interface Icomment{
    userId: Types.ObjectId | string,
    commentId: Types.ObjectId | string,
    reply : string,
    postId : Types.ObjectId | string,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date,
}