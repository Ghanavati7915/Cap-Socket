<template>
  <div style="padding:20px">
    <div> Cap Socket From Nuxt Socket Module ,  <span style="font-weight: bold;font-size: large">playground!</span> </div>
    <h1 class="text-2xl font-bold">Playground Cap-Socket</h1>
    <p>پیام‌ها در کنسول لاگ می‌شوند.</p>
  </div>
</template>


<script setup lang="ts">
//#region Import
import { onMounted } from "vue"
import { useSocket } from "../../src/runtime/plugin"
//#endregion

//#region Variables
let socket = null
//#endregion

//#region Instance
//#endregion

//#region Watch
//#endregion

//#region Constructor
onMounted(() => {
  const socket = useSocket()

  // listener برای هر دو Socket.IO و SignalR
  socket.on("message", (msg) => {
    console.log("New Message From Server:", msg)
  })
  //
  // socket.onDisconnect((reason) => {
  //   console.warn("⚠️ Socket disconnected:", reason)
  // })

  // ارسال پیام
  socket.send("SendMessage", "Hi from Playground!")
})
//#endregion

</script>
