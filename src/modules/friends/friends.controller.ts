import Router, { NextFunction, Request, Response } from 'express';
import { auth } from '../../middleware/auth.middelware';
import { friendsService } from './friends.service';
import SucessResponce from '../../common/exceptions/sucess.responce';



const router = Router();


router.post('/addFriend', auth, async (req: Request, res: Response) => {
    let UserData = await friendsService.addFriend(req.userId as string, req.body.email)
    return SucessResponce({ res, message: "Success", status: 200, data: UserData })
})



// router.patch('/update-profile-BigAsset', auth, async (req: Request, res: Response) => {
//     let UserData = await friendsService.UpdateProileBigAssets(req.userId as string, req.file as Express.Multer.File)
//     return SucessResponce({ res, message: "Success", status: 200, data: UserData })
// })



export default router;