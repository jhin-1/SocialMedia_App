import Router, { NextFunction, Request, Response } from 'express';
import { auth } from '../../middleware/auth.middelware';
import {postService} from './post.service';
import SucessResponce from '../../common/exceptions/sucess.responce';
import { uploadFile } from '../../common/utils/multer/cloude';
import { MulterEnum } from '../../common/enums/multer.enums';
import autauthorization from '../../middleware/authorization';
import { ValidationSchema } from '../../middleware/validation.middelware';
import { createPostSchema, getPostSchema } from './post.validtion';
import { getDto } from './post.dto';



const router = Router();


router.post('/create',auth,uploadFile({storageKey: MulterEnum.diskStorage}).array("attachments", 4),ValidationSchema(createPostSchema),async (req:Request,res:Response)=>{
    let post = await postService.createPost(req.body,req.userId as string,req.files as Express.Multer.File[])
    return SucessResponce({res,message:"Created Successfully",status:201,data:post})
})

router.get("/post/:id",auth,ValidationSchema(getPostSchema),async(req:Request,res:Response)=>{
    let post = await postService.getpost(req.params as getDto)
    return SucessResponce({res,message:"Sucessfully",status:200,data:post})
})

router.get("",auth,async(req:Request,res:Response)=>{
    let posts = await postService.getPosts(req.query )
    return SucessResponce({res,message:"Sucessfully",status:200,data:posts})
})

router.put("/updatePost/:id",auth,async(req:Request,res:Response)=>{
    let post = await postService.updatePost(req.params as any,req.userId! as string,req.body)
    return SucessResponce({res,message:"Updated Successfully",status:200,data:post})
})

export default router;