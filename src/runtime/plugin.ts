import { defineNuxtPlugin, useRuntimeConfig } from "#app"
import { SocketManager } from "./socketManager"

export default defineNuxtPlugin(async (nuxtApp) => {
    const config = useRuntimeConfig().public.socket || {
        type: "none",
        url: "",
    }

    const socket = new SocketManager(config)
    if (config.type !== "none") {
        await socket.connect()
    }

    // inject برای استفاده در کل برنامه
    nuxtApp.provide("socket", socket)
})
