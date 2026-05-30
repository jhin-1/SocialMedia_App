import express, { Request, Response } from "express"
import { type Express } from "express"
import { globalErrorHandler } from "./middleware/error.middleware"
import { authRouter, userRouter } from "./modules"
import cors from "cors"
import { env } from "./config/env.service"
import DBConnection from "./database/connection"
import { redisService } from "./common/services/redis.service"
import { pipeline } from "stream";
import { promisify } from "util";
import s3Service from "./common/services/s3.service";
import { NotFoundException } from './common/exceptions/applecation.excptions';
import SucessResponce from "./common/exceptions/sucess.responce"


let s3GetFile = promisify(pipeline) // pipeline is a function that allows us to pipe the s3 stream to the response stream


const bootstrap = async(): Promise<void> => {
    
    const app: Express = express()

    app.use(express.json())
    app.use(cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"]
}));
    app.use("/upload",express.static("upload"))

    // route to get image from s3 bucket
    app.get('/image_profile/*path',async(req:Request,res:Response)=>{
    let { path } = req.params as {path:string[]} // path is an array of strings

    let {donwload,filename} = req.query as {donwload?:string,filename?:string}

    if(!path){
        throw new NotFoundException("File Not Found!")
    }

    let key = path.join("/") //  convert array to string with "/" as separator

    let {Body,ContentType} = await s3Service.getAsset({key})

    s3GetFile(Body as NodeJS.ReadableStream,res) // pipe the s3 stream to the response stream

    res.setHeader("Content-Type",ContentType as string)
    res.set("Cross-Origin-Resource-Policy","cross-origin") // for frontendt to access the file
    if(donwload == "true"){
        res.setHeader("Content-Disposition",`attachment; filename="${filename ||key.split("/").pop()}"`)
    }
    return res
})
    // get presigned url for image
    app.get('/image_profile_presigned/*path',async(req:Request,res:Response)=>{
    let { path } = req.params as {path:string[]} // path is an array of strings

    let {donwload,filename} = req.query as {donwload:string,filename:string}

    if(!path){
        throw new NotFoundException("File Not Found!")
    }
    
    let key = path.join("/") // convert array to string with "/" as separator
    
    let url = await s3Service.getPresignedUrl({key, donwload, filename})
    return SucessResponce({res,message:"Success",status:200,data:{url}})
})


    // monogDB connection
    DBConnection()
    redisService.connect();

    // routes
    app.use("/api/v1/auth", authRouter)
    app.use("/api/v1/users", userRouter)
    
    // global error handler
    app.use(globalErrorHandler)

    app.listen(env.PORT, ()=>{
        console.log(`Server is running on port ${env.PORT}`)
    })
}

export default bootstrap