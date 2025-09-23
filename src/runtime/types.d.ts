import { SocketManager } from "./socketManager"

declare global {
    interface Window {
        __capSocket?: SocketManager
    }
}
