import { io, Socket as SocketIOClient } from "socket.io-client"
import * as signalR from "@microsoft/signalr"

export interface SocketOptions {
    type: "socketio" | "signalr" | "none"
    url: string
}

type CallbackFn = (...args: any[]) => void

export class SocketManager {
    private type: SocketOptions["type"]
    private url: string
    private socketIO?: SocketIOClient
    private signalRConn?: signalR.HubConnection
    private listeners: Record<string, CallbackFn[]> = {}

    constructor(options: SocketOptions) {
        this.type = options.type
        this.url = options.url
    }

    async connect() {
        if (this.type === "socketio") {
            this.socketIO = io(this.url)
            this.socketIO.on("connect", () => {
                console.log("[CAP-SOCKET] Socket.IO connected!")
            })
            // register listeners
            for (const event in this.listeners) {
                this.listeners[event].forEach(cb => this.socketIO?.on(event, cb))
            }
        }
        else if (this.type === "signalr") {
            this.signalRConn = new signalR.HubConnectionBuilder()
                .withUrl(this.url)
                .withAutomaticReconnect()
                .build()

            // register listeners
            for (const event in this.listeners) {
                this.signalRConn.on(event, (...args) => {
                    this.listeners[event].forEach(cb => cb(...args))
                })
            }

            await this.signalRConn.start()
            console.log("[CAP-SOCKET] SignalR connected!")
        }
    }

    send(event: string, payload?: any) {
        if (this.type === "socketio") {
            this.socketIO?.emit(event, payload)
        } else if (this.type === "signalr") {
            this.signalRConn?.invoke(event, payload).catch(console.error)
        }
    }

    on(event: string, callback: CallbackFn) {
        if (!this.listeners[event]) this.listeners[event] = []
        this.listeners[event].push(callback)

        if (this.type === "socketio" && this.socketIO) {
            this.socketIO.on(event, callback)
        } else if (this.type === "signalr" && this.signalRConn) {
            this.signalRConn.on(event, callback)
        }
    }
}
