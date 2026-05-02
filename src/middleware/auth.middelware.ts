import { BadRequestEception, UnauthorizedException } from "../common/exceptions/applecation.excptions";
import { TokenService } from "../common/services/token.service"
import {redisService} from '../common/services/redis.service';
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";


const tokenService = new TokenService

declare global {
    namespace Express{
        interface Request{
            userId?:string,
            token?:string,
            decode?: JwtPayload
        }
    }
}

export const auth =async(req:Request,res:Response,next:NextFunction)=>{
    let {authorization} = req.headers;
    if(!authorization){
        throw new  UnauthorizedException("Invalid Token")
    }
    const [flag,token] = authorization.split(' ')

    if (!flag || !token) {
    throw new BadRequestEception(`Invalid authorization format`)
    }

    switch(flag){
        case"Basic":
            let data = Buffer.from(token, "base64").toString()
            let [email,password] = data.split(":")
            break;

        case"Bearer":
            let decodeData = tokenService.decodeAccessToken(token) as JwtPayload // funcation to decode the data { id:'69ae1079fe08c9016714dfa2',iat: 1773273517,nbf: 1773273547,exp: 1773359917,aud:'User',iss: 'http://localhost:3000'}
            
            // if user is logged out send unauthorized
            let revoked = await redisService.get(`revokeToken:${decodeData.id}::${token}`)

            if(revoked){
                throw new UnauthorizedException("already logged out")
            }

            req.userId = decodeData.id // userid from token
            req.token = token // token itself
            req.decode = decodeData // {id:"",aud:"",iat:"",exp:""}
            next()
    }
}