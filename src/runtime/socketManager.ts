import { io, Socket as SocketIOClient } from "socket.io-client"
import * as signalR from "@microsoft/signalr"

export interface SocketOptions {
    type: "socketio" | "signalr"
    url: string
    debug?: boolean
    reconnectAttempts?: number
    reconnectDelay?: number
    reconnectDelayMax?: number
    timeout?: number
    signalRConnectionType?: "WebSockets" | "LongPolling" | "Both" // حذف none
}

/* -------------------------------- Types -------------------------------- */

type CallbackFn = (...args: any[]) => void

/* ============================== SocketManager ============================== */

export class SocketManager {
    //#region Private Properties
    private type: SocketOptions["type"]
    private url: string
    private socketIO?: SocketIOClient
    private signalRConn?: signalR.HubConnection
    private listeners: Record<string, CallbackFn[]> = {}
    private debug: boolean
    private options: SocketOptions
    private reconnectAttempt = 0
    private _isConnected = false
    private _isReconnecting = false
    private token?: string | (() => string | null)
    //#endregion

    //#region Constructor
    constructor(options: SocketOptions) {
        this.type = options.type
        this.url = options.url
        this.debug = options.debug ?? true
        this.options = options
    }
    //#endregion

    //#region Token
    setToken(token?: string | (() => string | null)) {
        this.token = token
    }

    private resolveToken(): string {
        if (!this.token) return ""
        if (typeof this.token === "function") return this.token() ?? ""
        return this.token
    }
    //#endregion

    //#region Logging
    private log(type: "info" | "warn" | "error", message: string, ...args: any[]) {
        if (!this.debug) return
        const prefix = "%c[CAP-SOCKET]"
        const styles: Record<typeof type, string> = {
            info: "color:#4caf50;font-weight:bold",
            warn: "color:#ff9800;font-weight:bold",
            error: "color:#f44336;font-weight:bold",
        }
        console[type](prefix, styles[type], message, ...args)
    }
    //#endregion

    //#region Public Connection State
    get isConnected(): "connected" | "disconnected" | "reconnecting" {
        if (this._isConnected) return "connected"
        if (this._isReconnecting) return "reconnecting"
        return "disconnected"
    }
    //#endregion

    //#region Connect Socket.IO
    private async connectSocketIO() {
        const opts = this.options

        this.socketIO = io(this.url, {
            reconnection: true,
            reconnectionAttempts: opts.reconnectAttempts ?? 5,
            reconnectionDelay: (opts.reconnectDelay ?? 2) * 1000,
            reconnectionDelayMax: (opts.reconnectDelayMax ?? 10) * 1000,
            timeout: (opts.timeout ?? 20) * 1000,
            auth: this.token ? { token: this.resolveToken() } : undefined,
        })

        this.socketIO.on("connect", () => {
            this.reconnectAttempt = 0
            this._isConnected = true
            this._isReconnecting = false
            this.log("info", "Socket.IO connected")
            this.emitInternal("connect")
        })

        this.socketIO.on("disconnect", reason => {
            this._isConnected = false
            this._isReconnecting = false
            this.log("warn", `Socket.IO disconnected: ${reason}`)
            this.emitInternal("disconnect", reason)
        })

        this.socketIO.on("connect_error", err => {
            this.reconnectAttempt++
            this._isConnected = false
            this._isReconnecting = true
            this.emitInternal("reconnecting", {
                attempt: this.reconnectAttempt,
                reason: err.message,
            })
        })

        for (const event in this.listeners) {
            this.listeners[event].forEach(cb => this.socketIO?.on(event, cb))
        }
    }
    //#endregion

    //#region Connect SignalR
    private async connectSignalR() {
        const transportMap: Record<string, signalR.HttpTransportType> = {
            WebSockets: signalR.HttpTransportType.WebSockets,
            LongPolling: signalR.HttpTransportType.LongPolling,
            Both: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        };

        const transportType =
            transportMap[this.options.signalRConnectionType ?? "Both"];

        this.signalRConn = new signalR.HubConnectionBuilder()
            .withUrl(this.url, {
                transport: transportType,
                // ارسال توکن در header Authorization
                headers: {
                    Authorization: `Bearer ${this.resolveToken()}`,
                },
            })
            .withAutomaticReconnect(this.buildSignalRReconnectDelays())
            .build();

        this.signalRConn.onclose(err => {
            this._isConnected = false;
            this._isReconnecting = false;
            this.emitInternal("disconnect", err?.message);
        });

        this.signalRConn.onreconnecting(err => {
            this._isConnected = false;
            this._isReconnecting = true;
            this.reconnectAttempt++;
            this.emitInternal("reconnecting", {
                attempt: this.reconnectAttempt,
                reason: err?.message,
            });
        });

        this.signalRConn.onreconnected(() => {
            this._isConnected = true;
            this._isReconnecting = false;
            this.reconnectAttempt = 0;
            this.emitInternal("connect");
        });

        for (const event in this.listeners) {
            this.signalRConn.on(event, (...args) =>
                this.listeners[event].forEach(cb => cb(...args))
            );
        }

        await this.attemptSignalRConnect();
    }

    //#endregion

    //#region SignalR Persistent Connect
    private async attemptSignalRConnect() {
        const retryDelay = (this.options.reconnectDelay ?? 2) * 1000

        while (true) {
            try {
                const timeout = (this.options.timeout ?? 20) * 1000
                await Promise.race([
                    this.signalRConn!.start(),
                    new Promise((_, reject) =>
                        setTimeout(
                            () =>
                                reject(
                                    new Error("SignalR connection timeout")
                                ),
                            timeout
                        )
                    ),
                ])

                this._isConnected = true
                this._isReconnecting = false
                this.reconnectAttempt = 0
                this.emitInternal("connect")
                break
            } catch {
                this._isReconnecting = true
                await this.delay(retryDelay)
            }
        }
    }
    //#endregion

    //#region Public Connect / Disconnect
    async connect() {
        if (this.type === "socketio") await this.connectSocketIO()
        else if (this.type === "signalr") await this.connectSignalR()
    }

    async disconnect() {
        try {
            if (this.type === "socketio" && this.socketIO) {
                this.socketIO.disconnect()
            }

            if (this.type === "signalr" && this.signalRConn) {
                await this.signalRConn.stop()
            }

            this._isConnected = false
            this._isReconnecting = false
            this.reconnectAttempt = 0

            this.emitInternal("disconnect", "manual")
            this.log("info", "Socket disconnected manually")
        } catch (err) {
            this.log("error", "Disconnect failed", err)
        }
    }
    //#endregion

    //#region Send
    async send(event: string, payload?: any) {
        if (this.type === "socketio") {
            if (!this.socketIO?.connected)
                throw new Error("Socket.IO not connected")
            this.socketIO.emit(event, payload)
        } else if (this.type === "signalr") {
            if (
                this.signalRConn?.state !==
                signalR.HubConnectionState.Connected
            )
                throw new Error("SignalR not connected")
            await this.signalRConn.invoke(event, payload)
        }
    }
    //#endregion

    //#region Events
    on(event: string, callback: CallbackFn) {
        if (!this.listeners[event]) this.listeners[event] = []
        this.listeners[event].push(callback)

        if (this.type === "socketio" && this.socketIO)
            this.socketIO.on(event, callback)

        if (this.type === "signalr" && this.signalRConn)
            this.signalRConn.on(event, callback)

        if (event === "connect" && this._isConnected) callback()
    }

    private emitInternal(event: string, ...args: any[]) {
        this.listeners[event]?.forEach(cb => cb(...args))
    }
    //#endregion

    //#region Utils
    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    private buildSignalRReconnectDelays(): number[] {
        const attempts = this.options.reconnectAttempts ?? 5
        const delay = (this.options.reconnectDelay ?? 2) * 1000
        const maxDelay = (this.options.reconnectDelayMax ?? 10) * 1000
        return Array.from({ length: attempts }, (_, i) =>
            Math.min(delay * (i + 1), maxDelay)
        )
    }
    //#endregion
}
