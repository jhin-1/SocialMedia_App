import Router, { NextFunction, Request, Response } from 'express';
import { auth } from '../../middleware/auth.middelware';
import {postService} from './post.service';
import SucessResponce from '../../common/exceptions/sucess.responce';
import { uploadFile } from '../../common/utils/multer/cloude';
import { MulterEnum } from '../../common/enums/multer.enums';
import autauthorization from '../../middleware/authorization';
import { ValidationSchema } from '../../middleware/validation.middelware';
import { createPostSchema } from './post.validtion';



const router = Router();


router.post('/create',auth,uploadFile({storageKey: MulterEnum.diskStorage}).array("attachments", 4),ValidationSchema(createPostSchema),async (req:Request,res:Response)=>{
    let post = await postService.createPost(req.body,req.userId as string,req.files as Express.Multer.File[])
    return SucessResponce({res,message:"Created Successfully",status:201,data:post})
})

router.get("/post/:id",auth,async(req:Request,res:Response)=>{
    let {id} = req.params 
    let post = await postService.getpost(id as string)  
    return SucessResponce({res,message:"Sucessfully",status:200,data:post})
})


export default router;