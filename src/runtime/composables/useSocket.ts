//#region Imports
import { ref, readonly } from "vue"
import type { SocketManager, SocketOptions } from "~/plugins/socketManager"
//#endregion

//#region State
const socketManagerRef = ref<SocketManager | null>(null)
const isConnected = ref(false)
//#endregion

//#region Init (manual usage)
export async function initSocket(config: SocketOptions) {
    const manager = new SocketManager(config)
    await manager.connect()

    socketManagerRef.value = manager
    isConnected.value = true

    manager.on("connect", () => {
        isConnected.value = true
    })

    manager.on("disconnect", () => {
        isConnected.value = false
    })
}
//#endregion

//#region Accessors
export function useSocket(): SocketManager {
    const nuxtApp = useNuxtApp()
    const socket =
        (nuxtApp.$socket as SocketManager | null) ??
        socketManagerRef.value

    if (!socket) {
        throw new Error("SocketManager not initialized yet!")
    }

    return socket
}

export const socketManager = readonly(socketManagerRef)
export const socketConnected = readonly(isConnected)
//#endregion
