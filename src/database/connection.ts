import  mongoose  from "mongoose";
import { env } from "../config/env.service";


const DBConnection =  () => {
    mongoose.connect(env.MONGO_URI).then(()=>{
        console.log(" Mongo Database connected successfully")
    }).catch((err)=>{
        console.log(" Mongo Database connection failed", err)
    })
}

export default DBConnection