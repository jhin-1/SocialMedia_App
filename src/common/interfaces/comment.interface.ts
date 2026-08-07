import { Types } from "mongoose";


export interface Icomment{
    userId: Types.ObjectId | string,
    comment : string,
    postId : Types.ObjectId | string,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date ,
}