import { Model, Types,HydratedDocument } from "mongoose";
import { DatabaseRepository } from "../../database/repository/base.repository";
import  userModel  from "../../database/models/user.model";
import { IUser } from "../../common/interfaces";
import { NotFoundException } from "../../common/exceptions/applecation.excptions";
import s3Service from "../../common/services/s3.service";
import { MulterEnum } from "../../common/enums/multer.enums";
import { sendNotificationFirebase } from "../../common/services/firebase.service";

class UserService{
    private userModel:Model<IUser> // this is Property of class
    private userRepository: DatabaseRepository<IUser>
    private s3 :  typeof s3Service 
    constructor(){
        this.userModel = userModel
        this.userRepository = new DatabaseRepository(this.userModel)
        this.s3 = s3Service
    }
    
    async getuserProfile(userId:string): Promise<IUser> {
        let userProfile = await this.userRepository.findById(userId).select("-password")
        if(!userProfile){
            throw new NotFoundException("user not found")
        }
        return userProfile  
    }

    async updateProfile(userId:string,file:Express.Multer.File): Promise<HydratedDocument<IUser>> {
        let userProfile = await this.userRepository.findById(userId).select("-password")
        if(!userProfile){
            throw new NotFoundException("user not found")
        }
        if(userProfile.profilePicture){
            await s3Service.deleteAsset({key:userProfile.profilePicture})
        }
        userProfile.profilePicture = await this.s3.uploadAsset({
            storageKey: MulterEnum.diskStorage,
            file,
            path:`Users/${userProfile._id.toString()}/Profile`,
        })
        await userProfile.save()
        return userProfile  
    }

    async UpdateProileBigAssets(userId:string,file:Express.Multer.File): Promise<HydratedDocument<IUser>>{
        let userProfile = await this.userRepository.findById(userId).select("-password")
        if(!userProfile){
            throw new NotFoundException("User Not Found!")
        }
        if(file){
            let { Key } = await this.s3.UploadBigAsset({
                file,
                path:`Users/${userProfile._id.toString()}/BigProfile`,
            })  
            userProfile.profilePicture = Key  as string
            await userProfile.save()
        }
        return userProfile
    }

    async updateCoverPictures(userId:string,files:Express.Multer.File[]) { //: Promise<HydratedDocument<IUser>>
        let userProfile = await this.userRepository.findById(userId).select("-password")
        if(!userProfile){
            throw new NotFoundException("user not found")
        }
        if(files.length > 0){
            let {result} = await this.s3.uploadAssets({ 
                files,
                path:`Users/${userProfile._id.toString()}/CoverPictures`,
            })
            userProfile.profileCover = result 
        }
        await userProfile.save()
        return userProfile  
    }

    async updateProfilePreSingUrl(userId:string): Promise<{url:string,userProfile:HydratedDocument<IUser>}>{
    let userProfile = await this.userRepository.findById(userId).select("-password")
    if(!userProfile){
        throw new NotFoundException("user not found")
    }
    let {key,url} = await this.s3.createPresignedUrl({
        path:`Users/${userProfile._id.toString()}/Profile`,
    })
    userProfile.profilePicture = key
    await userProfile.save()
    return {url,userProfile} 
    }

    async sendNotification(userId:string,FCM_Token:string): Promise<HydratedDocument<IUser>>{
        let user = await this.userRepository.findoneAndUpdate({
            _id: new Types.ObjectId(userId)
        },
            {
                $addToSet:{
                    fcm_tokens:FCM_Token
                }
            })
        if(!user){
            throw new NotFoundException("user Not found!")
        }
        await sendNotificationFirebase(user._id.toString(),{title:"SocialMedia",body:`Welcome ${user.userName}`})
        return user
    }

}

export const userService = new UserService()