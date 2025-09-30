import { defineNuxtPlugin } from "#app"
import { SocketManager, SocketOptions } from "./socketManager"

let socketManager: SocketManager | null = null

export default defineNuxtPlugin(async (nuxtApp) => {
    let debug = true // default
    let config: SocketOptions = { type: "none", url: "" }

    if (process.client) {
        try {
            const res = await fetch("/cap_socket_config.json")
            const json = await res.json()
            config = json.socket || config

            // read debug from config
            debug = config.debug ?? true

            if (config.type !== "none") {
                socketManager = new SocketManager(config)
                socketManager.connect() // don't await, connect handles retries
            }

            // فقط برای debug
            if (debug) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ;(window as any).__capSocket = socketManager
            }
        } catch (err) {
            log("warn", "[CAP-SOCKET] config load failed, sockets disabled.", err)
        }
    }

    // inject globally → قابل دسترس از طریق useNuxtApp().$socket یا useSocket()
    nuxtApp.provide("socket", socketManager)

    log("success", "Plugin injected by CAP Socket! 🎉", { debug })
})

// composable
export function useSocket(): SocketManager {
    const nuxtApp = useNuxtApp()
    const socket = nuxtApp.$socket as SocketManager | null
    if (!socket) throw new Error("SocketManager not initialized yet!")
    return socket
}

// unified log function
function log(
    type: "info" | "warn" | "error" | "success",
    message: string,
    ...args: any[]
) {
    const debug =
        (typeof window !== "undefined" &&
            (window as any).__capSocket?.options?.debug) ?? true
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

// add typings
declare module "#app" {
    interface NuxtApp {
        $socket: SocketManager | null
    }
}

declare module "vue" {
    interface ComponentCustomProperties {
        $socket: SocketManager | null
    }
}
