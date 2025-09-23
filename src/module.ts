import { defineNuxtModule, addPlugin, createResolver } from "@nuxt/kit"

export interface ModuleOptions {
    type: "signalr" | "socketio" | "none"
    url: string
    options?: any
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: "cap-socket",
        configKey: "socket",
    },
    defaults: {
        type: "none",
        url: "",
    },
    setup(_, nuxt) {
        const resolver = createResolver(import.meta.url)
        addPlugin(resolver.resolve("./runtime/plugin"))
    },
})
