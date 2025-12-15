import { defineNuxtPlugin } from "#app"
import { SocketManager, SocketOptions } from "./socketManager"

let socketManager: SocketManager | null = null

export default defineNuxtPlugin(async (nuxtApp) => {
    let debug = true
    let config: SocketOptions = { type: "none", url: "" }

    if (process.client) {
        try {
            const res = await fetch("/cap_socket_config.json")
            const json = await res.json()
            config = json.socket || config
            debug = config.debug ?? true

            if (config.type !== "none") {
                socketManager = new SocketManager(config)
            }

            if (debug) {
                ;(window as any).__capSocket = socketManager
            }
        } catch (err) {
            log("warn", "[CAP-SOCKET] config load failed", err)
        }
    }

    nuxtApp.provide("socket", socketManager)
    log("success", "CAP Socket plugin loaded (lazy connect)")
})

/* ------------------------------ logger ------------------------------ */

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
        info: "color:#4caf50;font-weight:bold",
        warn: "color:#ff9800;font-weight:bold",
        error: "color:#f44336;font-weight:bold",
        success: "color:#8bc34a;font-weight:bold",
    }

    console[type === "success" ? "log" : type](
        prefix,
        styles[type],
        message,
        ...args
    )
}
