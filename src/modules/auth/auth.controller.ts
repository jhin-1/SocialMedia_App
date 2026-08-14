import { Router } from "express";
import type{ Request, Response } from "express";
import AuthService from "./auth.service";
import SucessResponce from "../../common/exceptions/sucess.responce";
import { loginSchema, signupSchema, verfiyEmailSchema } from "./auth.validtion";
import { ValidationSchema } from "../../middleware/validation.middelware";
import { uploadFile } from "../../common/utils/multer/cloude";
import { MulterEnum } from "../../common/enums/multer.enums";


const router = Router()

router.post("/login", ValidationSchema(loginSchema), async (req:Request, res:Response)=>{
    const data = await AuthService.login(req.body)
    return SucessResponce({res,message:"Login successful",status:200,data:data})
})

router.post("/signup",uploadFile({storageKey: MulterEnum.diskStorage}).single("image"),ValidationSchema(signupSchema), async (req:Request, res:Response)=>{
    const data = await AuthService.signup(req.body)
    return SucessResponce({res,message:"Signup successful",status:201,data:data})
})

router.put("/verfiyEmail",ValidationSchema(verfiyEmailSchema),async(req:Request,res:Response)=>{
    const data = await AuthService.verfiyEmail(req.body)
    return SucessResponce({res,message:"Signup successful",status:201,data:data})
})

router.post("/google", async (req:Request, res:Response)=>{
    const data = await AuthService.OAuth_Google(req.body)
    return SucessResponce({res,message:"Login with Google successful",status:200,data:data})
})


export default router