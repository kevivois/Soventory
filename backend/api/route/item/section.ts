import express from "express"
import instance from "../../Connection"
import { FormatNumberLength } from "../../../utils"
const Connection = instance.getInstance()
const router = express.Router()
const auth = require("../../middleware/auth")
const { isAdmin, canRead, canWrite } = require("../../middleware/roles")
const { ItemIntegrity, ItemFKIntegrity } = require("../../middleware/requestIntegrity")

router.get("/all",[auth, canRead], async (req:any, res:any)  => {
    var query = await Connection.query(`select * from materiel`)
    return res.status(200).send(query)
})
router.get("/:id", [auth, canRead], async(req:any, res:any)  => {
    var query = await Connection.query(`select * from materiel where id="${req.params.id}"`)
})
router.post("/create",[auth, canWrite], async (req:any, res:any)  => {
    if(req.body.nom == undefined || req.body.nom == "")
    {
        return res.status(400).send({"error":"invalid request"})
    }
    var Existing = await Connection.query(`select * from materiel where nom="${req.body.nom}"`)
    if(Existing.length > 0)
    {
        return res.status(400).send({"error":"already exists"})
    }
    var query = await Connection.query(`insert into materiel (nom) values ("${req.body.nom}")`)
    return res.status(200).send({ "id": query.insertId })
})
router.post("/:id/update",[auth, canWrite], async (req:any, res:any) => {
    if(req.body.nom == undefined || req.body.nom == "")
    {
        return res.status(400).send({"error":"invalid request"})
    }
    var Existing = await Connection.query(`select * from materiel where nom="${req.body.nom}"`)
    if(Existing.length > 0)
    {
        return res.status(400).send({"error":"already exists"})
    }
    var query = await Connection.query(`update materiel set nom="${req.body.nom}" where id="${req.params.id}"`)
    return res.status(200).send({ "id": req.params.id })
})


export default router;