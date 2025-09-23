export default defineNuxtConfig({
  modules: ['../src/module'],
  ssr:false,
    socket: {
        type: "signalr", // یا "socketio" یا "none"
        url: "http://localhost:5000/hub",
    },
})
