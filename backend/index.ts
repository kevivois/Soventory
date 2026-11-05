import express from "express"
import api from "./server/setupApi"

const app = express()
app.use(api)

export default app
