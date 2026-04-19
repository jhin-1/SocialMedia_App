import express from "express"
import { type Express } from "express"
import { globalErrorHandler } from "./middleware/error.middleware"
import { authRouter } from "./modules"
import cors from "cors"
import { env } from "./config/env.service"
import DBConnection from "./database/connection"
import { redisService } from "./common/services/redis.service"

    
const bootstrap = async(): Promise<void> => {
    
    const app: Express = express()

    app.use(cors(),express.json())
    app.use("/upload",express.static("upload"))


    // monogDB connection
    DBConnection()
    redisService.connect();

    // routes
    app.use("/api/v1/auth", authRouter)
    
    // global error handler
    app.use(globalErrorHandler)


    app.listen(env.PORT, ()=>{
        console.log(`Server is running on port ${env.PORT}`)
    })
}

export default bootstrap