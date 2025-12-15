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
import { ref, onMounted } from 'vue'

const socket = useSocket()
const messages = ref<string[]>([])

const sendPing = () => {
  socket.send("callUserTest", {
    userId: "12345",
    payload: { name: "ali", age: 30 }
  })
}

const registerListeners = () => {
  socket.on('connect', () => {
    messages.value.push('✅ Connected to socket')
    socket.send("register", '12345')
  })

  socket.on('disconnect', (reason) => {
    messages.value.push(`⚠ Disconnected: ${reason}`)
  })

  socket.on('reconnecting', (data) => {
    messages.value.push(`🔄 Reconnecting attempt #${data.attempt}`)
  })

  socket.on('ping', payload => {
    messages.value.push(`📩 Ping: ${JSON.stringify(payload)}`)
  })
}

onMounted(async () => {
  //If Do You Want Send JWT Authorization Token
  socket.setToken(() => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiI2Y2YxYzA5My0wODcyLTQ5NDctZmIzNi0wOGRhNmVkNmJjYzUiLCJVc2VybmFtZSI6ImdoYW5hdmF0aSIsImp0aSI6IjVjY2IyMTgyLWRiMDAtNDA3MC1iOTRiLWFhMjc5YmUwZmUwNCIsIkFwcElkIjoiZTg0MGNmOTMtZWE2MS00ZDdjLWJiODctYjY2MDUyZDgwMzIxIiwiUm9sZSI6WyJhZG1pbiIsImRlZmF1bHQiXSwiUGVybWlzc2lvbiI6WyJWZWhpY2xlVmlldyIsIlZlaGljbGVVcGRhdGUiLCJQdXNoU2V0dGluZyIsIlZlaGljbGVNb2RlbFZpZXciLCJWZWhpY2xlTW9kZWxVcGRhdGUiLCJWZWhpY2xlQ2F0ZWdvcnlWaWV3IiwiVmVoaWNsZUNhdGVnb3J5VXBkYXRlIiwiVmVoaWNsZVNldHRpbmdWaWV3IiwiVmVoaWNsZVNldHRpbmdVcGRhdGUiLCJWZWhpY2xlRGV2aWNlVmlldyIsIlZlaGljbGVEZXZpY2VTZXR0aW5nIiwiVXNlclJvbGVQZXJtaXNzaW9uVXBkYXRlIiwiVXNlclJvbGVQZXJtaXNzaW9uVmlldyIsIlVzZXJEcml2ZXJWaWV3IiwiVXNlckRyaXZlclVwZGF0ZSIsIlVzZXJFbXBWaWV3IiwiVXNlckVtcFVwZGF0ZSIsIk1vbml0b3JNYXAiLCJNb25pdG9yTGluZSIsIkJhc2VDb3JyaWRvclZpZXciLCJCYXNlQ29ycmlkb3JVcGRhdGUiLCJCYXNlQXJlYVZpZXciLCJCYXNlQXJlYVVwZGF0ZSIsIkJhc2VHZW9WaWV3IiwiQmFzZUdlb1VwZGF0ZSIsIkJhc2VHZW9UeXBlVmlldyIsIkJhc2VHZW9UeXBlVXBkYXRlIiwiQmFzZUxpbmVWaWV3IiwiQmFzZUxpbmVVcGRhdGUiLCJCYXNlU3RhdGlvblZpZXciLCJCYXNlU3RhdGlvblVwZGF0ZSIsIkJhc2VPcmdhblZpZXciLCJCYXNlT3JnYW5VcGRhdGUiLCJUaGlyZFBhcnR5U2VydmljZUFjY2VzcyIsIkJ1c1RpbWVTaGVldFRhYmxlIiwiQWxsb2NhdGlvblZlaGljbGVUb0xpbmUiLCJTZW5kVG9TaXBhZCIsIlJlcG9ydFZlaGljbGVTaXBhZCIsIlJlcG9ydFZlaGljbGVTcGVlZCIsIlJlcG9ydFZlaGljbGVFdmVudHMiLCJSZXBvcnRWZWhpY2xlUHJvZmlsZSIsIlJlcG9ydFZlaGljbGVTZXR0aW5nIiwiUmVwb3J0VmVoaWNsZUNyb3NzU3RhdGlvbiIsIlJlcG9ydFZlaGljbGVUcmF2ZWxlZERpc3RhbmNlIiwiUmVwb3J0UlRQSVMiLCJSZXBvcnRMb2ciLCJSZXBvcnRTdG9wcGluZ1RpbWUiLCJSZXBvcnRXb3JraW5nVGltZSIsIlJlcG9ydExpbmVDeWNsZSIsIlJlcG9ydFZlaGljbGVTdW1tYXJ5IiwiUmVwb3J0T3V0T2ZMb2NhdGlvbiIsIlJlcG9ydEJ1c1RpbWVTaGVldFRhYmxlIiwiUmVwb3J0Q2hhbmdlTGluZSJdLCJleHAiOjE3NjU4NzA1MjJ9.g5KZbfXT7_bxVbYPyD1FyCFt6lTWkECkmFhDQW7Da5U')
  await socket.connect()
  registerListeners()
})
</script>


<style scoped>
body {
  font-family: system-ui, sans-serif;
}
</style>
