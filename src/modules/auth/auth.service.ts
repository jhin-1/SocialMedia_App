import { HydratedDocument, Model } from "mongoose";
import { BadRequestEception, NotFoundException } from "../../common/exceptions/applecation.excptions";
import { LoginDto, SignupDto, verfiyEmailDto } from "./auth.dto";
import { IUser } from "../../common/interfaces";
import userModel from "../../database/models/user.model";
import { DatabaseRepository } from "../../database/repository/base.repository";
import { compareText, hashText } from "../../common/utils/security";
import { sendEmail } from "../../common/utils/mail/email.service";
import { redisService } from "../../common/services/redis.service";
import { env } from "../../config/env.service";
import { ProviderEnum } from "../../common/enums";
import { TokenService } from "../../common/services/token.service";
import { OAuth2Client } from "google-auth-library";


let code :number = Number(Math.random().toFixed(5).split(".")[1])

class AuthService {
    private userModel:Model<IUser>
    private userRepository: DatabaseRepository<IUser>
    private tokenService: TokenService
    constructor(){
        this.userModel = userModel
        this.userRepository = new DatabaseRepository(this.userModel)
        this.tokenService = new TokenService
    }

    async login(data: LoginDto){
        let {email,password} = data
        let existeduser = await this.userRepository.findOne({email,provider:ProviderEnum.System})
        if(existeduser){
            const ismatched = await compareText(password,existeduser.password)
            if(ismatched){
                let{accessToken, RefreshToken} = this.tokenService.generateToken(existeduser,env.BASE_URL)
                return {existeduser,accessToken,RefreshToken}
            }else{
                throw new BadRequestEception("email or password not invalid")
            }
        }
        throw new NotFoundException("user not found!")
    }

    async signup(data:SignupDto):Promise<IUser>{
        let Existuser = await this.userRepository.findOne({email:data.email})
        if(Existuser){
            throw new BadRequestEception("Email already exists")
        }
        data.password = await hashText(data.password)

        let NewUser: HydratedDocument<IUser> = await this.userRepository.create(data)
        if(!NewUser){
            throw new BadRequestEception("Failed to create user")
        }
        sendEmail({to:NewUser.email,subject:"Welcome to our social media app",html:`<h1>Welcome ${NewUser.userName}</h1><p>Thank you for signing up to our social media app <h2>your verification code is ${code}</h2>. We are excited to have you on board!</p>`})
        
        redisService.set({key:`OTP::${NewUser._id}`,value:code,ttl:60*5})
        return NewUser 
    }
    
    async verfiyEmail(data:verfiyEmailDto):Promise<HydratedDocument<IUser>>{
        
        let EmailUser = await this.userRepository.findOne({email:data.email})
        if(!EmailUser){
            throw new NotFoundException("user Not Found!")
        }
        if(EmailUser.confirmEmail){
            throw new BadRequestEception("your email is verfived")
        }
        let checkcode :string|null = await redisService.get(`OTP::${EmailUser._id}`)

        if (!checkcode){
            throw new NotFoundException("Not found OTP please check your Email")
        }
        if(checkcode !== data.code){
            throw new BadRequestEception("invalid OTP")
        }
        let verfiyEmail  = await userModel.findByIdAndUpdate({_id:EmailUser._id},{confirmEmail:true},{new:true})

        if (!verfiyEmail) {
        throw new NotFoundException("User not found during update")
        }
        return verfiyEmail
    }
/*
{
[1]   iss: 'https://accounts.google.com',
[1]   azp: '697655260551-c989ao15ag754rp59qp4d9vdvbg2hhr1.apps.googleusercontent.com',
[1]   aud: '697655260551-c989ao15ag754rp59qp4d9vdvbg2hhr1.apps.googleusercontent.com',
[1]   sub: '101492361879710220588',
[1]   email: 'ahmedyosri52@gmail.com',
[1]   email_verified: true,
[1]   nbf: 1777727192,
[1]   name: 'Ahmed Yosri',
[1]   picture: 'https://lh3.googleusercontent.com/a/ACg8ocIhvTUyhiPwwxRpZiIMdmeMmpIgQVGUpdhLKOaIgorbAWyY8Qw5=s96-c',
[1]   given_name: 'Ahmed',
[1]   family_name: 'Yosri',
[1]   iat: 1777727492,
[1]   exp: 1777731092,
[1]   jti: '3bb2631077b361f47a51e2960094f30ffded4aa8'
[1] }
*/
    async OAuth_Google(token:{idToken:string}){
        const client = new OAuth2Client()
        const ticket = await client.verifyIdToken({
            idToken: token.idToken,
            audience: env.GOOGLE_CLIENT_ID
        })
        const payload = ticket.getPayload()

        if(!payload || !payload.email){
            throw new BadRequestEception("Invalid Google token")
        }
        let existeduser = await this.userRepository.findOne({ email: payload.email })
        if(existeduser){
            return existeduser
        }


        if (!payload.email_verified) {
            throw new BadRequestEception("Email not verified by Google")
        }

        let NewUser = await this.userRepository.create(
            {
            userName: payload.name!,
            email:payload.email!,
            provider:ProviderEnum.Google!,
            profilePicture:payload.picture!,
            confirmEmail:true!
            }
        )
        let {accessToken, RefreshToken} = this.tokenService.generateToken(NewUser,env.BASE_URL)
        return {NewUser,accessToken,RefreshToken}
    }
}

export default new AuthService  
