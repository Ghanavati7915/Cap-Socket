<template>
  <div style="padding:20px">
    <div> Cap Socket From Nuxt Socket Module ,  <span style="font-weight: bold;font-size: large">playground!</span> </div>
    <h1 class="text-2xl font-bold">
      Playground Cap-Socket
      <span v-if="isConnected == 'reconnecting'">🔄</span>
      <span v-if="isConnected == 'connected'">✅</span>
      <span v-if="isConnected == 'disconnected'">❌</span>
    </h1>

    <div style="margin-top: 10px">
      <span style="font-weight: bold">REGISTER USER -> </span>
      <span> User ID :</span>
      <input type="text" v-model="userID" style="margin: auto 10px"/>
      <button v-if="isConnected == 'connected'" @click="register"> Register </button>
      <div v-if="isConnected == 'reconnecting'"> Trying To Connect </div>
      <div v-if="isConnected == 'disconnected'"> Socket Disconnected </div>
    </div>

    <div style="margin-top: 10px">
      <span style="font-weight: bold">CALL USER -> </span>
      <span> User ID :</span>
      <input type="text" v-model="RQ_UserID" style="margin: auto 10px"/>
      <button v-if="isConnected == 'connected'" @click="sendJoinRequest"> Send Request </button>
      <div v-if="isConnected == 'reconnecting'"> Trying To Connect </div>
      <div v-if="isConnected == 'disconnected'"> Socket Disconnected </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, watch, onMounted } from "vue"

const { socket, isConnected } = useSocket() // socket is a computed ref

const userID = ref<string>("")
const RQ_UserID = ref<string>("")

const register = () => {
  const mgr = socket.value
  if (mgr) mgr.send("register", userID.value)
}

const sendJoinRequest = () => {
  const mgr = socket.value
  if (!mgr) return
  const requestModel = {
    userId: RQ_UserID.value,
    payload: { name: "ali", age: 30 }
  }
  mgr.send("callUserTest", requestModel)
}

function attachListeners(mgr: any) {
  // avoid attaching duplicates: you can add guards if needed
  mgr.on("connect", () => console.log("✅ Connected"))
  mgr.on("disconnect", () => console.log("❌ Disconnected"))
  mgr.on("reconnecting", () => console.log("🔄️ Reconnecting"))
  mgr.on("reconnected", () => console.log("️✳️ Reconnected"))
  mgr.on("error", (data: any) => console.log("⚠️ Error :", data))

  mgr.on("connect", () => {
    mgr.send("sendMessage", "Hi from Playground!")
  })

  mgr.on("message", (msg: any) => console.log("New Message From Server:", msg))
  mgr.on("call", (msg: any) => console.log("New Call From Server:", msg))
}


watch(
    () => socket,
    (mgr) => {
      console.log('* isConnected : ' , isConnected.value)
      console.log('* mgr : ' , mgr)
      if (mgr.value) attachListeners(mgr)
    },
    { immediate: true,deep: true }
)

watch(
    () => socket.value, // این مقدار واقعی SocketManager
    (mgr) => {
      if (!mgr) return; // هنوز مقدار نگرفته
      console.log('* mgr ready :', mgr)
      attachListeners(mgr)
    },
    { immediate: true }
)

onMounted(() => {
  // if socket manager already available
  if (socket.value) attachListeners(socket.value)
})
</script>

