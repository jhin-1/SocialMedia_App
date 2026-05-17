import Router, { Request, Response } from 'express';
import { auth } from '../../middleware/auth.middelware';
import {userService} from './user.service';
import SucessResponce from '../../common/exceptions/sucess.responce';
import { uploadFile } from '../../common/utils/multer/cloude';
import { MulterEnum } from '../../common/enums/multer.enums';



const router = Router();


router.get('/user-profile', auth, async(req:Request,res:Response)=>{
    let UserData = await userService.getuserProfile(req.userId as string)
    return SucessResponce({res,message:"Success",status:200,data:UserData})
})

router.patch('/update-profile', auth,uploadFile({storageKey: MulterEnum.diskStorage}).single("image"), async(req:Request,res:Response)=>{
    let UserData = await userService.updateProfile(req.userId as string,req.file as Express.Multer.File)
    return SucessResponce({res,message:"Success",status:200,data:UserData})
})


router.patch('/update-profile-BigAsset', auth,uploadFile({storageKey: MulterEnum.diskStorage}).single("image"), async(req:Request,res:Response)=>{
    let UserData = await userService.UpdateProileBigAssets(req.userId as string,req.file as Express.Multer.File)
    return SucessResponce({res,message:"Success",status:200,data:UserData})
})


router.patch('/update-cover-pictures', auth,uploadFile({storageKey: MulterEnum.diskStorage}).array("files"), async(req:Request,res:Response)=>{
    let UserData = await userService.updateCoverPictures(req.userId as string,req.files as Express.Multer.File[])
    return SucessResponce({res,message:"Success",status:200,data:UserData})
})


router.patch('/update-profile-presigned-url', auth, async(req:Request,res:Response)=>{
    let UserData = await userService.updateProfilePreSingUrl(req.userId as string)
    return SucessResponce({res,message:"Success",status:200,data:UserData})
})






export default router;