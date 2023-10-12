import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import tasksRoutes from "./routes/tasks.js"



const app = express()

app.use(cors({
    origin: true,
    credentials:true
}))

app.use(express.json())

app.use("/auth", authRoutes)
app.use("/tasks", tasksRoutes)



app.listen(8080, ()=>console.log("Connected!"))