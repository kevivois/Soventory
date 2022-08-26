import express from "express"
import instance from "../../Connection"
import { FormatNumberLength } from "../../../utils"
const Connection = instance.getInstance()
const router = express.Router()
const auth = require("../../middleware/auth")
const { isAdmin, canRead, canWrite } = require("../../middleware/roles")
const { ItemIntegrity, ItemFKIntegrity } = require("../../middleware/requestIntegrity")

router.get("/all", [auth, canRead], async (req: any, res: any) => {
    
        var query = await Connection.query(`select * from marque`)
        return res.status(200).send(query)
})
router.get("/:id", [auth, canRead], async (req: any, res: any) => {
    var id = req.params.id
    var query = await Connection.query(`select * from marque where id = ${id}`)
    return res.status(200).send(query)
})
router.post("/create", [auth, canWrite], async (req: any, res: any) => {
    var isExisting = await Connection.query(`select * from marque where nom = "${req.body.nom}"`)
    if (isExisting[0]) { return res.status(400).send({ "error": "nom already exists" }) }
    var nom = req.body.nom
    var query = await Connection.query(`insert into marque (nom) values ("${nom}")`)
    return res.status(200).send({ "id": query.insertId })
})
router.post("/:id/update", [auth, canWrite], async (req: any, res: any) => {
    var isExisting = await Connection.query(`select * from marque where nom = "${req.body.nom}"`)
    if (isExisting[0]) { return res.status(400).send({ "error": "nom already exists" }) }
    var nom = req.body.nom
    var id = req.params.id
    if(!nom || !id) {
        return res.status(400).send({ "error": "nom and id are required" })
    }

    var query = await Connection.query(`update marque set nom = "${nom}" where id = ${id}`)
    return res.status(200).send({ "id": query.insertId })
})
export default router