<template>
  <div style="padding:20px">
    <div> Cap Socket From Nuxt Socket Module ,  <span style="font-weight: bold;font-size: large">playground!</span> </div>
    <h1 class="text-2xl font-bold">
      Playground Cap-Socket
      <span v-if="socket.isConnected == 'reconnecting'">🔄</span>
      <span v-if="socket.isConnected == 'connected'">✅</span>
      <span v-if="socket.isConnected == 'disconnected'">❌</span>
    </h1>

    <div style="margin-top: 10px">
      <span style="font-weight: bold">REGISTER USER -> </span>
      <span> User ID :</span>
      <input type="text" v-model="userID" style="margin: auto 10px"/>
      <button v-if="socket.isConnected == 'connected'" @click="register"> Register </button>
      <div v-if="socket.isConnected == 'reconnecting'"> Trying To Connect </div>
      <div v-if="socket.isConnected == 'disconnected'"> Socket Disconnected </div>
    </div>

    <div style="margin-top: 10px">
      <span style="font-weight: bold">CALL USER -> </span>
      <span> User ID :</span>
      <input type="text" v-model="RQ_UserID" style="margin: auto 10px"/>
      <button v-if="socket.isConnected == 'connected'" @click="sendJoinRequest"> Send Request </button>
      <div v-if="socket.isConnected == 'reconnecting'"> Trying To Connect </div>
      <div v-if="socket.isConnected == 'disconnected'"> Socket Disconnected </div>
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
const RQ_UserID = ref<string>('')
//#endregion

//#region Functions
const register = () => {
  socket.send("register", userID.value)
}
const sendJoinRequest = () => {
  let requestModel = {
    userId : RQ_UserID.value,
    payload : {
      name : 'ali',
      age : 30
    }
  }
  socket.send("callUserTest", requestModel)
}
const socketHandle = () =>{
  socket.on("connect", () => console.log("✅ Connected"))
  socket.on("disconnect", () => console.log("❌ Disconnected"))
  socket.on("reconnecting", () => console.log("🔄️ Reconnecting"))
  socket.on("reconnected", () => console.log("️✳️ Reconnected"))
  socket.on("error", (data) => console.log("⚠️ Error : " , data))

  //#region Connect
  socket.on("connect", () => {
    socket.send("sendMessage", "Hi from Playground!")
  })
  //#endregion

  //#region Call
  socket.on("message", (msg:any) => {
    console.log("New Message From Server:", msg)
  })
  //#endregion

  //#region Call
  socket.on("call", (msg:any) => {
    console.log("New Call From Server:", msg)
  })
  //#endregion
}
//#endregion

//#region Constructor
onMounted(() => {
  socketHandle();
})
//#endregion
</script>
