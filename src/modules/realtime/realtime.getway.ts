import { Server, Socket } from "socket.io"
import { IUser } from "../../common/interfaces"
import { TokenService } from "../../common/services/token.service"
import { JwtPayload } from "jsonwebtoken"
import userModel from "../../database/models/user.model"
import { Server as HttpServerType } from "node:http"
import { redisService } from "../../common/services/redis.service";
import { chatGetway } from "../chat"





export interface IAuthSocket extends Socket {
    data: IUser
}

export class RealTimeGetWay {

    private io!: Server
    private tokenService: TokenService
    private redisService = redisService;

    constructor() {
        this.tokenService = new TokenService()
    }

    authentication = async (socket: IAuthSocket, next: any) => {
        try {
            const { id } = await this.tokenService.decodeAccessToken(socket.handshake.auth.token || socket.handshake.headers.token) as JwtPayload

            console.log({ userID: id, socket_id: socket.id })

            let userData = await userModel.findById(id)
            console.log({ userData })

            if (!userData) {
                throw new Error("User not found")
            }
            socket.data = userData.toObject() as IUser
            // const userIdStr = userData._id.toString()

            await this.redisService.addSocket(
                userData._id.toString(),
                socket.id
            );

            next()
        } catch (erorr) {
            next(erorr)
        }

    }

    initializeIO = (httpserver: HttpServerType) => {

        this.io = new Server(httpserver, {
            cors: {
                origin: "*",
                credentials: true
            }
        })

        this.io.use(this.authentication)

        this.io.on("connection", async (socket: IAuthSocket) => {

            console.log("connected form realTime", socket.id)

            chatGetway.registerEvents(socket, this.io)


            socket.on("disconnect", async () => {
                await this.redisService.removeSocket(socket.data._id!.toString(), socket.id)
                const connections = await this.redisService.getSockets(socket.data._id!.toString()) || []
                if (connections.length < 1) {
                    this.io.emit("offline_user", { userID: socket.data._id })
                }

            })
        })




    }


}


export const realTimeGetway = new RealTimeGetWay()