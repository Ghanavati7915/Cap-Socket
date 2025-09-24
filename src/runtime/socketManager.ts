import { io, Socket as SocketIOClient } from "socket.io-client"
import * as signalR from "@microsoft/signalr"

export interface SocketOptions {
    type: "socketio" | "signalr" | "none"
    url: string
    debug?: boolean

    // Reconnect settings (seconds)
    reconnectAttempts?: number
    reconnectDelay?: number
    reconnectDelayMax?: number

    // Timeout settings (seconds)
    timeout?: number
}

type CallbackFn = (...args: any[]) => void

export class SocketManager {
    //#region Private properties
    private type: SocketOptions["type"]
    private url: string
    private socketIO?: SocketIOClient
    private signalRConn?: signalR.HubConnection
    private listeners: Record<string, CallbackFn[]> = {}
    private debug: boolean
    private options: SocketOptions
    private reconnectAttempt = 0
    //#endregion

    //#region Constructor
    constructor(options: SocketOptions) {
        this.type = options.type
        this.url = options.url
        this.debug = options.debug ?? true
        this.options = options
    }
    //#endregion

    //#region Logging
    private log(type: "info" | "warn" | "error", message: string, ...args: any[]) {
        if (!this.debug) return
        const prefix = "%c[CAP-SOCKET]"
        const styles: Record<typeof type, string> = {
            info: "color: #4caf50; font-weight: bold",
            warn: "color: #ff9800; font-weight: bold",
            error: "color: #f44336; font-weight: bold",
        }
        console[type](prefix, styles[type], message, ...args)
    }
    //#endregion

    //#region Socket.IO connect
    private async connectSocketIO() {
        const opts = this.options
        this.socketIO = io(this.url, {
            reconnection: true,
            reconnectionAttempts: opts.reconnectAttempts ?? 5,
            reconnectionDelay: (opts.reconnectDelay ?? 2) * 1000,
            reconnectionDelayMax: (opts.reconnectDelayMax ?? 10) * 1000,
            timeout: (opts.timeout ?? 20) * 1000,
        })

        this.socketIO.on("connect", () => {
            this.reconnectAttempt = 0
            this.log("info", "Socket.IO connected!")
            this.emitInternal("connect")
        })

        this.socketIO.on("disconnect", reason => {
            this.log("warn", `Socket.IO disconnected: ${reason}`)
            this.emitInternal("disconnect", reason)
        })

        this.socketIO.on("connect_error", err => {
            this.reconnectAttempt++
            this.log("warn", `Socket.IO connect attempt #${this.reconnectAttempt} failed: ${err.message}`)
            this.emitInternal("reconnecting", { attempt: this.reconnectAttempt, reason: err.message })
        })

        // register listeners
        for (const event in this.listeners) {
            this.listeners[event].forEach(cb => this.socketIO?.on(event, cb))
        }
    }
    //#endregion

    //#region SignalR connect
    private async connectSignalR() {
        this.signalRConn = new signalR.HubConnectionBuilder()
            .withUrl(this.url, { transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling })
            .withAutomaticReconnect(this.buildSignalRReconnectDelays())
            .build()

        this.signalRConn.onclose(err => {
            this.log("warn", "SignalR closed:", err?.message)
            this.emitInternal("disconnect", err?.message)
        })

        this.signalRConn.onreconnecting(err => {
            this.reconnectAttempt++
            const reason = err?.message || "Reconnecting..."
            this.log("warn", `SignalR reconnect attempt #${this.reconnectAttempt}: ${reason}`)
            this.emitInternal("reconnecting", { attempt: this.reconnectAttempt, reason })
        })

        this.signalRConn.onreconnected(id => {
            this.reconnectAttempt = 0
            this.log("info", `SignalR reconnected: ${id}`)
            this.emitInternal("reconnected", id)
        })

        // register listeners
        for (const event in this.listeners) {
            this.signalRConn.on(event, (...args) => {
                this.listeners[event].forEach(cb => cb(...args))
            })
        }

        // Persistent connect attempt
        await this.attemptSignalRConnect()
    }
    //#endregion

    //#region Persistent SignalR connect attempt
    private async attemptSignalRConnect() {
        const retryDelay = (this.options.reconnectDelay ?? 2) * 1000

        while (true) {
            try {
                // 1️⃣ Check server availability
                let urlObj = new URL(this.url);
                let baseUrl = `${urlObj.origin}/`;
                const reachable = await fetch(baseUrl, { method: "ALIVE" })
                    .then(res => res.ok)
                    .catch(() => false)

                if (!reachable) {
                    this.reconnectAttempt++
                    this.emitInternal("status", { type: "error", message: "SignalR server unreachable", attempt: this.reconnectAttempt })
                    this.log("warn", `⚠️ SignalR server unreachable, attempt #${this.reconnectAttempt}`)
                    await this.delay(retryDelay)
                    continue
                }

                // 2️⃣ Start connection with timeout
                const timeout = (this.options.timeout ?? 20) * 1000
                await Promise.race([
                    this.signalRConn!.start(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("❌ SignalR connection timeout")), timeout))
                ])

                // Connected successfully
                this.reconnectAttempt = 0
                this.emitInternal("connect")
                this.emitInternal("status", { type: "connected" })
                this.log("info", "✅ SignalR connected!")
                break

            } catch (err: any) {
                this.reconnectAttempt++
                this.emitInternal("error", err)
                this.emitInternal("status", { type: "error", message: err.message || err, attempt: this.reconnectAttempt })
                this.log("warn", `❗SignalR connect attempt #${this.reconnectAttempt} failed: ${err.message}`)
                await this.delay(retryDelay)
            }
        }
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    //#endregion

    //#region Public connect
    async connect() {
        try {
            if (this.type === "socketio") {
                await this.connectSocketIO()
            } else if (this.type === "signalr") {
                await this.connectSignalR()
            }
        } catch (err: any) {
            this.emitInternal("error", err)
            this.emitInternal("status", { type: "error", message: err.message || err })
        }
    }
    //#endregion

    //#region Send
    async send(event: string, payload?: any) {
        try {
            if (this.type === "socketio") {
                if (!this.socketIO?.connected) throw new Error("❌ Socket.IO not connected")
                this.socketIO.emit(event, payload)
                this.log("info", `Socket.IO -> Sent [${event}]`, payload)
            } else if (this.type === "signalr") {
                if (this.signalRConn?.state !== signalR.HubConnectionState.Connected)
                    throw new Error("SignalR not connected")
                await this.signalRConn.invoke(event, payload)
                this.log("info", `SignalR -> Sent [${event}]`, payload)
            }
        } catch (err: any) {
            this.emitInternal("error", err)
            this.emitInternal("status", { type: "error", message: err.message || err })
        }
    }
    //#endregion

    //#region Event handling
    on(event: string, callback: CallbackFn) {
        if (!this.listeners[event]) this.listeners[event] = []
        this.listeners[event].push(callback)

        if (this.type === "socketio" && this.socketIO) this.socketIO.on(event, callback)
        else if (this.type === "signalr" && this.signalRConn) this.signalRConn.on(event, callback)
    }

    private emitInternal(event: string, ...args: any[]) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(...args))
        }
    }
    //#endregion

    //#region SignalR reconnect delays builder
    private buildSignalRReconnectDelays(): number[] {
        const attempts = this.options.reconnectAttempts ?? 5
        const delay = (this.options.reconnectDelay ?? 2) * 1000
        const maxDelay = (this.options.reconnectDelayMax ?? 10) * 1000
        const delays: number[] = []

        for (let i = 0; i < attempts; i++) {
            delays.push(Math.min(delay * (i + 1), maxDelay))
        }

        return delays
    }
    //#endregion
}
