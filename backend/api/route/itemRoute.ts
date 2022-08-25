
import express from "express"
import instance from "../Connection"
const Connection = instance.getInstance()
const router = express.Router()
const auth = require("../middleware/auth")

router.get("/:id",[auth],(req:any,res:any) =>  {

    var query = Connection.query(`select * from item where id="${req.params.id}`)

    return query
})


export default router