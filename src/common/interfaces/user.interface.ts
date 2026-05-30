import { Types } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enums/index";

export interface IUser {
    _id?: string | Types.ObjectId,
    userName: string,
    firstName?: string,
    lastName?: string,
    email: string,
    phone: string,
    profilePicture?: string,
    profileCover?: string[],
    password: string,
    gender?: GenderEnum,
    role?: RoleEnum,
    provider?: ProviderEnum,
    confirmEmail: boolean,
    createdAt?: Date,
    updatedAt?: Date,
    fcm_tokens?:string[]
}

