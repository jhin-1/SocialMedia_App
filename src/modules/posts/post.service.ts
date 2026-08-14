import { Model, HydratedDocument } from "mongoose";
import { DatabaseRepository } from "../../database/repository/base.repository";
import postModel from "../../database/models/post.model";
import { IPost, IUser } from "../../common/interfaces";
import {
  BadRequestEception,
  NotFoundException,
  UnauthorizedException,
} from "../../common/exceptions/applecation.excptions";
import s3Service from "../../common/services/s3.service";
import { sendNotificationFirebase } from "../../common/services/firebase.service";
import { createDto, getDto } from "./post.dto";
import userModel from "../../database/models/user.model";
import { Visibility } from "../../common/enums";
import { ParsedPath } from "path";
class PostService {
  private postModel: Model<IPost>;
  private postRepository: DatabaseRepository<IPost>;
  private userRepository: DatabaseRepository<IUser>;
  private s3: typeof s3Service;
  constructor() {
    this.postModel = postModel;
    this.postRepository = new DatabaseRepository(this.postModel);
    this.userRepository = new DatabaseRepository(userModel);
    this.s3 = s3Service;
  }

  async createPost(
    data: createDto,
    userId: string,
    Files: Express.Multer.File[],
  ): Promise<IPost> {
    let { content, tags, visibility } = data;

    tags = Array.from(new Set(tags)); // remove duplicate

    if (tags && tags.length) {
      let users = await Promise.all(
        tags.map((id) => this.userRepository.findById(id).select(" ")),
      );

      let notfound_users = users.some((user) => user === null);

      if (notfound_users) {
        throw new BadRequestEception("user is not found!");
      }

      if (users.length !== tags.length) {
        throw new NotFoundException("One or more tags are not valid");
      }
    }

    let images;
    if (Files && Files.length) {
      let { result } = await this.s3.uploadAssets({
        files: Files as Express.Multer.File[],
        path: `posts/${userId}/attachmentPost`,
      });
      images = result;
    }

    let post = await this.postRepository.create({
      userId,
      content,
      tags,
      attachments: images ? images : undefined,
      visibility: visibility ?? Visibility.PUBLIC,
    });
    return post;
  }

  async getpost({ id }: getDto): Promise<IPost> {
    let post = await this.postRepository
      .findById(id)
      .select(" userId content attachments tags ")
      .populate("userId");
    if (!post) {
      throw new NotFoundException("post not found!");
    }
    return post;
  }

async getPosts(query: qs.ParsedQs) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 5;

  const skip = (page - 1) * limit;

  const posts = await this.postModel
    .find()
    .skip(skip)
    .limit(limit);

  if (posts.length === 0) {
    throw new NotFoundException("Posts not found!");
  }

  return posts;
}

  async updatePost(postId: any, userId: string, data: Partial<IPost>) {
    let { id } = postId;
    let post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException("post not found!");
    }
    if (post.userId.toString() !== userId) {
      throw new UnauthorizedException("you are not authorized to update this post!");
    }

    return true;
  }
}

export const postService = new PostService();
