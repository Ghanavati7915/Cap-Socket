<template>
  <div style="padding:20px">
    <div> Cap Socket From Nuxt Socket Module ,  <span style="font-weight: bold;font-size: large">playground!</span> </div>
    <h1 class="text-2xl font-bold">Playground Cap-Socket</h1>
    <div>
      <span> userID :</span>
      <input type="text" v-model="userID" style="margin: auto 10px"/>
      <button @click="register"> Register </button>
    </div>
  </div>
</template>


<script setup lang="ts">
//#region Import
import { onMounted,ref } from "vue"
import { useSocket } from "../../src/runtime/plugin"
//#endregion

//#region Instance
const socket = useSocket()
//#endregion

//#region Variables
const userID = ref<string>('')
//#endregion

//#region Constructor
const register = () => {
  socket.send("register", userID.value)
}
const socketHandle = () =>{
  socket.on("connect", () => console.log("✅ Connected"))
  socket.on("disconnect", () => console.log("❌ Disconnected"))
  socket.on("reconnecting", () => console.log("❗️ Reconnecting"))
  socket.on("reconnected", () => console.log("✳️ Reconnected"))
  socket.on("error", () => console.log("⚠️ Error"))

  socket.on("connect", () => {
    socket.send("sendMessage", "Hi from Playground!")
  })

  socket.on("message", (msg:any) => {
    console.log("New Message From Server:", msg)
  })
}
onMounted(() => {
  socketHandle();
})
//#endregion

</script>
