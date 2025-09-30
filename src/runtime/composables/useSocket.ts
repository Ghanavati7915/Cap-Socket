import { ref, readonly, computed } from "vue"
import { SocketManager, SocketOptions } from "../socketManager"

const socketManagerRef = ref<SocketManager | null>(null)
const isConnected = ref(false)

export async function initSocket(config: SocketOptions) {
    const manager = new SocketManager(config)
    await manager.connect()
    socketManagerRef.value = manager
    isConnected.value = true

    // لیسنرهای تغییر وضعیت
    manager.on("connect", () => {
        isConnected.value = true
    })
    manager.on("disconnect", () => {
        isConnected.value = false
    })
}

export function useSocket() {
    const nuxtApp = useNuxtApp()
    const socket = nuxtApp.$socket as SocketManager | null
    if (!socket) throw new Error("SocketManager not initialized yet!")
    return socket
}

// برای استفاده در جاهای خاص
export const socketManager = readonly(socketManagerRef)
export const socketConnected = readonly(isConnected)
