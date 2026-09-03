import { Types } from "mongoose";

export interface friendsInterface {
    id: Types.ObjectId | string,
    userId: Types.ObjectId | string,
    friends: Array<Types.ObjectId | string>,
}