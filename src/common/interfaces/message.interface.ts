import { Types } from "mongoose";

export interface messageInterface {
    id: Types.ObjectId | string,
    senderId: Types.ObjectId | string,
    message: string,
    roomId: Types.ObjectId | string,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date,
}