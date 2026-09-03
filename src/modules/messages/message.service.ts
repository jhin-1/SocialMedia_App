import { Model, HydratedDocument } from "mongoose";
import { DatabaseRepository } from "../../database/repository/base.repository";
import postModel from "../../database/models/post.model";
import { IUser, messageInterface } from "../../common/interfaces";
import {
  BadRequestEception,
  NotFoundException,
  UnauthorizedException,
} from "../../common/exceptions/applecation.excptions";
import s3Service from "../../common/services/s3.service";
import userModel from "../../database/models/user.model";
import MessageModel from "../../database/models/message.model";
import { Visibility } from "../../common/enums";
class MessageService {
  private messageModel: Model<messageInterface>;
  private messageRepository: DatabaseRepository<messageInterface>;
  private userRepository: DatabaseRepository<IUser>;
  private s3: typeof s3Service;
  constructor() {
    this.messageModel = MessageModel;
    this.messageRepository = new DatabaseRepository(this.messageModel);
    this.userRepository = new DatabaseRepository(userModel);
    this.s3 = s3Service;
  }

  async createMessage(data: { message: string }, userId: string): Promise<HydratedDocument<messageInterface>> {
    let { message } = data

    if (!message) {
      throw new BadRequestEception("Message can't be empty")
    }

    let newMessage = await this.messageRepository.create({
      message,
      senderId: userId,
    })
    return newMessage
  }

}

export const messageService = new MessageService();
