import * as signalR from "@microsoft/signalr"
import { io, Socket } from "socket.io-client"

export type SocketType = "signalr" | "socketio" | "none"

interface SocketOptions {
    type: SocketType
    url: string
    options?: any
}

export class SocketManager {
    private type: SocketType
    private url: string
    private options: any
    private connection: signalR.HubConnection | Socket | null = null

    constructor(config: SocketOptions) {
        this.type = config.type
        this.url = config.url
        this.options = config.options || {}
    }

    async connect() {
        if (this.type === "signalr") {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(this.url, this.options)
                .withAutomaticReconnect()
                .build()
            await this.connection.start()
        } else if (this.type === "socketio") {
            this.connection = io(this.url, this.options)
        }
    }

    on(event: string, callback: (...args: any[]) => void) {
        if (!this.connection) return
        if (this.type === "signalr") {
            ;(this.connection as signalR.HubConnection).on(event, callback)
        } else if (this.type === "socketio") {
            ;(this.connection as Socket).on(event, callback)
        }
    }

    async send(event: string, ...args: any[]) {
        if (!this.connection) return
        if (this.type === "signalr") {
            await (this.connection as signalR.HubConnection).invoke(event, ...args)
        } else if (this.type === "socketio") {
            ;(this.connection as Socket).emit(event, ...args)
        }
    }
}
