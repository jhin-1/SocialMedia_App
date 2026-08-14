import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { Visibility } from "../enums";


export interface IPost {

    userId: Types.ObjectId | IUser | string,
    content?: string| undefined,
    attachments?: string[] | undefined,
    tags?:string[]|IUser[]| undefined,
    likes?:string[]|IUser[]| undefined,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date ,
    restoredAt?: Date
    visibility?: Visibility |string
}