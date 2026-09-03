import { Server } from "socket.io";
import { IAuthSocket } from "../../realtime";
import { chatEvent, ChatEvent } from "./chat.event";




export class ChatGetway {
    private chatEvent: ChatEvent
    constructor() {
        this.chatEvent = chatEvent
    }


    registerEvents = (socket: IAuthSocket, io: Server) => {
        this.chatEvent.sayHi(socket)

    }

}


export const chatGetway = new ChatGetway()