<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">CAP Socket Playground</h1>

    <p>Status:
      <span
          :class="{
          'text-green-600': socket.isConnected === 'connected',
          'text-yellow-600': socket.isConnected === 'reconnecting',
          'text-red-600': socket.isConnected === 'disconnected'
        }">
        {{ socket.isConnected }}
      </span>
    </p>

    <div class="mt-4">
      <button
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          @click="sendPing"
          :disabled="socket.isConnected !== 'connected'"
      >
        Send Ping
      </button>
    </div>

    <div class="mt-4">
      <h2 class="font-semibold mb-2">Messages:</h2>
      <ul class="list-disc list-inside">
        <li v-for="(msg, idx) in messages" :key="idx">{{ msg }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
const socket = useSocket()

// reactive messages list
const messages = ref<string[]>([])

const userID = ref<string>("12345")
const RQ_UserID = ref<string>("12345")

// ارسال پیام تست
const sendPing = () => {
  if (socket) {
    const requestModel = {
      userId: RQ_UserID.value,
      payload: { name: "ali", age: 30 }
    }
    socket.send("callUserTest", requestModel)
  }
}

const socketHandler = () => {
  socket.on('connect', () => {
    messages.value.push('✅ Connected to socket')
    socket.send("sendMessage", "Hi from Playground!")
    socket.send("register", '12345')
  })

  socket.on('disconnect', (reason) => {
    messages.value.push(`⚠ Disconnected: ${reason}`)
  })

  socket.on('reconnecting', (data) => {
    messages.value.push(`🔄 Reconnecting attempt #${data.attempt}`)
  })

  socket.on('ping', (payload) => {
    messages.value.push(`📩 Ping received: ${JSON.stringify(payload)}`)
  })

  socket.on('call', (payload) => {
    messages.value.push(`📩 call received: ${JSON.stringify(payload)}`)
  })

  socket.on('message', (payload) => {
    messages.value.push(`📩 message received: ${JSON.stringify(payload)}`)
  })

  socket.on('broadcast', (payload) => {
    messages.value.push(`📩 broadcast received: ${JSON.stringify(payload)}`)
  })

  socket.on('Broadcast', (payload) => {
    messages.value.push(`📩 Broadcast received: ${JSON.stringify(payload)}`)
  })

  socket.on('BroadCast', (payload) => {
    messages.value.push(`📩 BroadCast received: ${JSON.stringify(payload)}`)
  })
}

watch(
    () => socket,
    (mgr) => {
      socketHandler()
    },
    { immediate: true,deep: true }
)

// ثبت listenerها
onMounted(() => {
  // if (!socket) return
  // testSocket()

})
</script>

<style scoped>
body {
  font-family: system-ui, sans-serif;
}
</style>
