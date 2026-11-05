import express from "express"
import api from "./api/setupApi"

const app = express()
app.use(api)

export default app
