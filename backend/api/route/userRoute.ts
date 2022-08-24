import express from "express"
import instance from "../Connection"
const Connection = instance.getInstance()
const router = express.Router()

router.get("/",async(req,res) => {
   
  var result = await Connection.query("select * from utilisateur")
  return res.status(202).json(result)
  
})



export default router;