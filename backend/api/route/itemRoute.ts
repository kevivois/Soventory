
import express from "express"
import instance from "../Connection"
const Connection = instance.getInstance()
const router = express.Router()

router.get("/:id",(req,res) =>  {

    var query = Connection.query(`select * from item where id="${req.params.id}`)

    return query
})


export default router