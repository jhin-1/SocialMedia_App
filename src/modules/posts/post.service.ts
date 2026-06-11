import { Model,HydratedDocument } from "mongoose";
import { DatabaseRepository } from "../../database/repository/base.repository";
import  postModel  from "../../database/models/post.model";
import { IPost, IUser } from "../../common/interfaces";
import { BadRequestEception, NotFoundException } from "../../common/exceptions/applecation.excptions";
import s3Service from "../../common/services/s3.service";
import { sendNotificationFirebase } from "../../common/services/firebase.service";
import { createDto } from "./post.dto";
import userModel from "../../database/models/user.model";
import { Visibility } from "../../common/enums";

class PostService{
    private postModel:Model<IPost> 
    private postRepository: DatabaseRepository<IPost>
    private userRepository: DatabaseRepository<IUser>
    private s3 :  typeof s3Service 
    constructor(){
        this.postModel = postModel
        this.postRepository = new DatabaseRepository(this.postModel)
        this.userRepository = new DatabaseRepository(userModel)
        this.s3 = s3Service
    }
    
    async createPost(data:createDto,userId:string,Files:Express.Multer.File[]):Promise<IPost>{
        let {content ,tags,visibility} = data 
        if (!content?.length && !Files.length){
            throw new BadRequestEception("please send content or attachments  ")
        }
        tags = Array.from(new Set(tags)) // remove duplicate 

        if(tags && tags.length ){
            let users = await Promise.all( tags.map((id)=>this.userRepository.findById(id).select(" ")) )
            let notfound_users = users.some((user)=> user === null)
            if(notfound_users){
                throw new BadRequestEception("user is not found!")
            }
            if(users.length !== tags.length){
                throw new NotFoundException("One or more tags are not valid")
            }
        }
        let images
        if( Files && Files.length ){
            let{result} = await this.s3.uploadAssets({
                files:Files as Express.Multer.File[] ,
                path:`posts/${userId}/attachmentPost`,
            })
            images  = result
        }
        let post = await this.postRepository.create({
            userId,
            content,
            tags,
            attachments: images? images : undefined,
            visibility: visibility ?? Visibility.PUBLIC
        })
        return post 
    }

    async getpost(id:string):Promise<IPost>{
        let post = await this.postRepository.findById(id).select(" userId content attachments").populate("userId")
        if(!post){
            throw new NotFoundException("post not found!")
        }
        return post
    }
}



export const postService = new PostService()