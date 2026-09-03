import { Model, Types, HydratedDocument } from "mongoose";
import { DatabaseRepository } from "../../database/repository/base.repository";
import userModel from "../../database/models/user.model";
import { friendsInterface, IUser } from "../../common/interfaces";
import { NotFoundException } from "../../common/exceptions/applecation.excptions";
import friendsModel from "../../database/models/friends.model";

class FriendsService {
    private friendsModel: Model<friendsInterface> // this is Property of class
    private userModel: Model<IUser> // this is Property of class
    private friendsRepository: DatabaseRepository<friendsInterface>

    constructor() {
        this.friendsModel = friendsModel
        this.userModel = userModel
        this.friendsRepository = new DatabaseRepository(this.friendsModel)
    }

    async addFriend(userId: string, email: string): Promise<friendsInterface> {
        let userexsist = await this.userModel.findById(userId)
        if (!userexsist) {
            throw new NotFoundException("user not found")
        }
        let friend = await this.userModel.findOne({ email: email })
        if (!friend) {
            throw new NotFoundException("friend not found")
        }
        let addedFriend = await this.friendsModel.findOneAndUpdate(
            { userId },
            {
                $addToSet: {
                    friends: friend._id
                }
            },
            {
                new: true,
                upsert: true
            }
        )
        return addedFriend
    }

}

export const friendsService = new FriendsService()