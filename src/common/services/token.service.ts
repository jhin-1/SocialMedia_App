import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../../config/env.service';
import { IUser } from '../interfaces';
import { RoleEnum } from '../enums';
import { BadRequestEception } from '../exceptions/applecation.excptions';


export class TokenService{
    constructor(){}
    generateToken(user:Partial<IUser>,host:string):{accessToken:string,RefreshToken:string}{
        let Signature = undefined; // genrate secret_key for [admin or user]
        let audience = undefined; // for know if this token for user of admin 
        let RefreshSingature = undefined;

        switch(user.role){
            case RoleEnum.Admin: // 0 is admin 
                Signature = env.ADMIN_SIGNATURE
                RefreshSingature = env.ADMIIN_REFRESH_TOKEN
                audience = "Admin"
                break;
    
            default:
                Signature = env.USER_SIGNATURE
                RefreshSingature = env.USER_REFRESH_TOKEN
                audience = "User"
                break;
        }
        let accessToken = jwt.sign({id:user._id},Signature,{ 
                        expiresIn:"30m",
                        // notBefore:"30s",
                        issuer:host,
                        audience
        }) // generate token with user id and secret keY
    
        let RefreshToken = jwt.sign({id:user._id},RefreshSingature,{
            expiresIn:"1y",
            issuer:host,
            audience
        })
        return {accessToken,RefreshToken}
    }

    decodeAccessToken(token:string): string | jwt.JwtPayload{
        let decode:string | jwt.JwtPayload | null = jwt.decode(token) as JwtPayload
        let Signature = undefined;
        if(!decode){
            throw new BadRequestEception(" Invlaid Token ")
        }
        switch(decode.aud){
            case"Admin":
                Signature = env.ADMIN_SIGNATURE
                break;
            default:
                Signature = env.USER_SIGNATURE
                break;
        }
        let decodeData = jwt.verify(token,Signature)
        return decodeData
    }

    decodeRefreshToken(token:string): string | jwt.JwtPayload{
        let decode = jwt.decode(token) as JwtPayload
        let RefreshSingature = undefined;
        if(!decode){
            throw new BadRequestEception(" Invlaid Token ")
        }
        switch(decode.aud){
            case"Admin":
                RefreshSingature = env.ADMIIN_REFRESH_TOKEN
                break;
            default:
                RefreshSingature = env.USER_REFRESH_TOKEN
                break;
        }
        let decodeData = jwt.verify(token,RefreshSingature)
        return decodeData
    }
}
