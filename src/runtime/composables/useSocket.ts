import { ref, readonly } from "vue"
import { SocketManager, SocketOptions } from "../socketManager"

const socketManagerRef = ref<SocketManager | null>(null)
const isConnected = ref(false)

export async function initSocket(config: SocketOptions) {
    const manager = new SocketManager(config)
    await manager.connect()
    socketManagerRef.value = manager
    isConnected.value = true
}

export function useSocket(): { socket: SocketManager | null; isConnected: boolean } {
    return { socket: socketManagerRef.value, isConnected: isConnected.value }
}

export const socketManager = readonly(socketManagerRef)
export const socketConnected = readonly(isConnected)
