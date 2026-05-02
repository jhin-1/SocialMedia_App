import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enums";
import { IUser } from "../../common/interfaces";
import { hashText } from "../../common/utils/security";



const UserSchema = new mongoose.Schema<IUser>({
    firstName:{
        type: String,
        required:true,
        
    },
    lastName:{
        type: String,
        required:true,
        
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    phone:{
        type: String,
        unique: true,
    },
    profilePicture:{
        type: String,
        default:"www.google.com/default-profile-picture.png"
    },
    profileCover:{
        type: [String],
    },
    password:{
        type: String,
        required: function(this){
            return this.provider == ProviderEnum.System
        }
    },
    gender:{
        type: Number,
        default: GenderEnum.Male,
    },
    role:{
        type: Number,
        default: RoleEnum.User,
    },
    provider:{
        type: Number,
        default: ProviderEnum.System,
    },
    confirmEmail:{
        type: Boolean,
        default: false
    }

},
{
    timestamps: true,
    toObject:{
        virtuals: true,
    }
}
)

UserSchema.virtual("userName").set(function(value){
    let [firtName, lastName] = value.split(" ")
    this.firstName = firtName
    this.lastName = lastName
}).get(function(){
    return `${this.firstName} ${this.lastName}`
})

//****hooks
// UserSchema.pre("save",async function(){
//     // do some thing before save
//     await hashText(this.password)
// })

// UserSchema.post("save",function(){

// })

const userModel = mongoose.model<IUser>("User", UserSchema)

export default userModel