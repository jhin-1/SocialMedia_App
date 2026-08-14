import { NextFunction, Request ,Response} from "express"
import { BadRequestEception, ForbiddenExcption } from "../common/exceptions/applecation.excptions"
import { JwtPayload } from "jsonwebtoken"


declare global {
    namespace Express{
        interface Request{
            userId?:string,
            token?:string,
            decode?: JwtPayload
        }
    }
}

let autauthorization = async(req:Request,res:Response,next:NextFunction)=>{
    let {decode}  = req
    if(!decode){
        throw new BadRequestEception("not Found the data")
    }
    if(decode.aud != "Admin"){
        throw new ForbiddenExcption("Access denied")
    }
    next()

}

export default autauthorization