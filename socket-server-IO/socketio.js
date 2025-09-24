import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"

const app = express()
app.use(cors()) // اجازه اتصال از هر دامنه (برای Playground)

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

// مسیر ساده تست
app.get("/", (req, res) => {
    res.send("Socket.IO server is running")
})

// اتصال کلاینت
io.on("connection", (socket) => {
    console.log("New Client Joined:", socket.id)

    // 👋 ارسال پیام خوش‌آمدگویی به کلاینت وصل شده
    const welcomeMsg = "Welcome to CAP Socket Playground! 🎉"
    socket.emit("message", welcomeMsg)

    // دریافت پاسخ از کلاینت
    socket.on("SendMessage", (msg) => {
        console.log("Client says:", msg)

        // پاسخ سرور به کلاینت که پیام فرستاده
        const replyMsg = `Server received your message: "${msg}" ✅`
        socket.emit("message", replyMsg)

        // ارسال پیام به همه کلاینت‌ها (اختیاری)
        io.emit("message", `Broadcast: ${msg}`)
    })

    socket.on("disconnect", () => {
        console.log("Client Disconnected:", socket.id)
    })
})

const PORT = 3001
httpServer.listen(PORT, () => {
    console.log(`Socket.IO server running on http://localhost:${PORT}`)
})
