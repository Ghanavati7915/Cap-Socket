import { defineNuxtModule, addPlugin, createResolver } from "@nuxt/kit"

export interface ModuleOptions {
    type: "signalr" | "socketio" | "none"
    url: string
    options?: any
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: "nuxt-socket-connector",
        configKey: "socket",
    },
    defaults: {
        type: "none",
        url: "",
    },
    setup(options, nuxt) {
        const resolver = createResolver(import.meta.url)
        nuxt.options.runtimeConfig.public.socket = options

        addPlugin(resolver.resolve("./runtime/plugin"))
    },
})
