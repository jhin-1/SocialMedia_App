import admin from "firebase-admin";
import {readFileSync} from "fs"
import { Types } from "mongoose";
import userModel from "../../database/models/user.model";
import { NotFoundException } from "../exceptions/applecation.excptions";



let serviceAccount = readFileSync("socialmediaapp-35802-firebase-adminsdk-fbsvc-233291eee3.json", "utf8")


admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccount.toString())),
    //storageBucket:"socialmediaapp-35802.appspot.com"
})


export let sendNotificationFirebase = async (userId: string, data: {title:string,body:any}) => {
    let user = await userModel.findOne(new Types.ObjectId(userId))
    if(!user){
        throw new NotFoundException("user Not found!")
    }
    if(user.fcm_tokens && user.fcm_tokens.length > 0){
        for(const token of user.fcm_tokens ){
            await admin.messaging().send({
                token,
                data
            })
        }
    }


}