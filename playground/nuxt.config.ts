import capSocket from "../src/module"

export default defineNuxtConfig({
    modules: [capSocket],
    ssr:false,
    devtools: { enabled: true }
})