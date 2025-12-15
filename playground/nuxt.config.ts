
export default defineNuxtConfig({
    modules: ['../src/module'],
    ssr:false,
    devtools: { enabled: true },
    devServer: {
        port:3000,
    },
})