import { defineNuxtPlugin } from "#app"
import { SocketManager, SocketOptions } from "./socketManager"

let socketManager: SocketManager | null = null

export default defineNuxtPlugin(async () => {
    console.log("Plugin injected by CAP Socket! 🎉")

    if (process.client) {
        try {
            const res = await fetch("/cap_socket_config.json")
            const json = await res.json()
            const config: SocketOptions = json.socket || { type: "none", url: "" }

            if (config.type !== "none") {
                socketManager = new SocketManager(config)
                await socketManager.connect()
            }

            window.__capSocket = socketManager
        } catch (err) {
            console.warn("[CAP-SOCKET] config load failed, sockets disabled.", err)
        }
    }
})

export function useSocket(): SocketManager {
    if (!socketManager) throw new Error("SocketManager not initialized yet!")
    return socketManager
}
