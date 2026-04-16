import { HydratedDocument, Model } from "mongoose";
import { BadRequestEception } from "../../common/exceptions/applecation.excptions";
import { LoginDto, SignupDto } from "./auth.dto";
import { IUser } from "../../common/interfaces";
import userModel from "../../database/models/user.model";
import { DatabaseRepository } from "../../database/repository/base.repository";
import { compareText, hashText } from "../../common/utils/security";
import { sendEmail } from "../../common/utils/mail/email.service";


let code  = Math.random().toFixed(4).split(".")[1]
class AuthService {
    private userModel:Model<IUser>
    private userRepository: DatabaseRepository<IUser>
    constructor(){
        this.userModel = userModel
        this.userRepository = new DatabaseRepository(this.userModel)
    }

    async login(data: LoginDto):Promise<HydratedDocument<IUser>>{
        let user = await this.userRepository.findOne({email:data.email})
        if(!user){
            throw new BadRequestEception("Invalid email or password")
        }
        let isMatched: boolean = await compareText(data.password,user.password)
        if(!isMatched){
            throw new BadRequestEception("Invalid email or password")
        }
        return user
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
        sendEmail({to:NewUser.email,subject:"Welcome to our social media app",html:`<h1>Welcome ${NewUser.userName}</h1><p>Thank you for signing up to our social media app. We are excited to have you on board!</p>`})
        return NewUser  
    }
}

export default new AuthService  