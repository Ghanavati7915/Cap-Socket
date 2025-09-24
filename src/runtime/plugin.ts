import { defineNuxtPlugin } from "#app"
import { SocketManager, SocketOptions } from "./socketManager"

let socketManager: SocketManager | null = null

export default defineNuxtPlugin(async () => {
    let debug = true // default

    if (process.client) {
        try {
            const res = await fetch("/cap_socket_config.json")
            const json = await res.json()
            const config: SocketOptions = json.socket || { type: "none", url: "" }

            // read debug from config
            debug = config.debug ?? true

            if (config.type !== "none") {
                socketManager = new SocketManager(config)
                socketManager.connect() // don't await, connect handles retries
            }

            window.__capSocket = socketManager

        } catch (err) {
            log("warn", "[CAP-SOCKET] config load failed, sockets disabled.", err)
        }
    }

    log("success", "Plugin injected by CAP Socket! 🎉", { debug })
})

export function useSocket(): SocketManager {
    if (!socketManager) throw new Error("SocketManager not initialized yet!")
    return socketManager
}

// unified log function for plugin and socketManager
function log(type: "info" | "warn" | "error" | "success", message: string, ...args: any[]) {
    const debug = window.__capSocket?.options?.debug ?? true
    if (!debug) return

    const prefix = "%c[CAP-SOCKET]"
    const styles: Record<typeof type, string> = {
        info: "color: #4caf50; font-weight: bold",
        warn: "color: #ff9800; font-weight: bold",
        error: "color: #f44336; font-weight: bold",
        success: "color: #8bc34a; font-weight: bold",
    }

    if (type === "success") console.log(prefix, styles[type], message, ...args)
    else console[type](prefix, styles[type], message, ...args)
}
