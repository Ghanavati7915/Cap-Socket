import { defineNuxtModule, addPlugin, createResolver } from "@nuxt/kit"

export interface ModuleOptions {
    type: "signalr" | "socketio" | "none"
    url: string
    options?: any
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: "cap-socket",
        configKey: "capSocket",
    },
    defaults: {
        type: "none",
        url: "",
    },
    setup(_, nuxt) {
        const resolver = createResolver(import.meta.url)

        // اضافه کردن پلاگین
        addPlugin({
            src: resolver.resolve("./runtime/plugin"),
            mode: "all",
        })

        // معرفی مسیر composables برای auto-import
        nuxt.hook("imports:dirs", (dirs) => {
            dirs.push(resolver.resolve("./runtime/composables"))
        })
    },
})
