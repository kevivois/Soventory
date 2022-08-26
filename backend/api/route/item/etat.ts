import express from "express"
import instance from "../../Connection"
import { FormatNumberLength } from "../../../utils"
const Connection = instance.getInstance()
const router = express.Router()
const auth = require("../../middleware/auth")
const { isAdmin, canRead, canWrite } = require("../../middleware/roles")
const { ItemIntegrity, ItemFKIntegrity } = require("../../middleware/requestIntegrity")

router.get("/all", [auth, canRead], async (req: any, res: any) => {
        var query = await Connection.query(`select * from etat`)
        return res.status(200).send(query)
})
router.get("/:id", [auth, canRead], async (req: any, res: any) => {
    var id = req.params.id
    var query = await Connection.query(`select * from etat where id = ${id}`)
    return res.status(200).send(query)
})
router.post("/create", [auth, canWrite], async (req: any, res: any) => {
    if(!req.body.nom || req.body.nom == ""){return res.status(400).send({"error":"nom is required"})}

    var Existing = await Connection.query(`select * from etat where nom = "${req.body.nom}"`)

    if(Existing[0] && Existing[0].nom == req.body.nom){return res.status(400).send({"error":"nom already exists"})}

    var query = await Connection.query(`insert into etat (nom) values ("${req.body.nom}")`)
    return res.status(200).send({"id":query.insertId})
})
router.post("/:id/update", [auth, canWrite], async (req: any, res: any) => {
    if(!req.body.nom || req.body.nom == ""){return res.status(400).send({"error":"nom is required"})}

    var Existing = await Connection.query(`select * from etat where nom = "${req.body.nom}"`)

    if(Existing[0] && Existing[0].nom == req.body.nom){return res.status(400).send({"error":"nom already exists"})}

    var query = await Connection.query(`update etat set nom = "${req.body.nom}" where id = ${req.params.id}`)
    return res.status(200).send({"id":query.insertId})
})
router.post("/:id/delete", [auth, canWrite], async (req: any, res: any) => {
    var query = await Connection.query(`delete from etat where id = ${req.params.id}`)
    return res.status(200).send({"id":query.insertId})
})
export default router;
