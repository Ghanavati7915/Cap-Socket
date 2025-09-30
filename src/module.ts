import { defineNuxtModule, addPlugin, createResolver } from "@nuxt/kit"

export interface ModuleOptions {
    type: "signalr" | "socketio" | "none"
    url: string
    options?: any
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: "cap-socket",
        configKey: "capSocket", // یکتا و مشخص برای تنظیمات
    },
    defaults: {
        type: "none",
        url: "",
    },
    setup(_, nuxt) {
        const resolver = createResolver(import.meta.url)

        // پلاگین
        addPlugin({
            src: resolver.resolve("./runtime/plugin"),
            mode: "all", // هم در ssr هم client
        })

        // کامپوزبل useSocket
        nuxt.hook("imports:dirs", (dirs) => {
            dirs.push(resolver.resolve("./runtime/composables"))
        })
    },
})
