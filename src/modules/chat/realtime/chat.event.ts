import { IAuthSocket } from "../../realtime";




export class ChatEvent {

    constructor() { }


    sayHi = (socket: IAuthSocket) => {
        try {
            socket.on("sayHi", (data) => {
                console.log({ data })
                socket.emit("sayHiBack", { message: "Hello from server" })
            })
        } catch (error) {
            socket.emit("custom_error", error)
        }
    }

}


export const chatEvent = new ChatEvent()