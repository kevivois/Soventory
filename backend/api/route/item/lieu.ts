import express from "express"
import instance from "../../Connection"
import { FormatNumberLength } from "../../../utils"
const Connection = instance.getInstance()
const router = express.Router()
const auth = require("../../middleware/auth")
const { isAdmin, canRead, canWrite } = require("../../middleware/roles")
const { ItemIntegrity, ItemFKIntegrity } = require("../../middleware/requestIntegrity")

router.post("/create", [auth, canWrite], async (req: any, res: any) => {


    if (!req.body.nom || req.body.nom == "") {
        return res.status(400).send({ "error": "nom is required" })
    }
    var Existing = await Connection.query(`select * from lieu where nom = "${req.body.nom}"`)

    if (Existing[0] && Existing[0].nom == req.body.nom) {
        return res.status(400).send({ "error": "nom already exists" })
    }

    var query = await Connection.query(`insert into lieu (nom) values ("${req.body.nom}")`)
    return res.status(200).send({ "id": query.insertId })
})
router.post("/:id/update", [auth, canWrite], async (req: any, res: any) => {

    if (!req.body.nom || req.body.nom == "") {
        return res.status(400).send({ "error": "nom is required" })
    }
    var Existing = await Connection.query(`select * from lieu where nom = "${req.body.nom}"`)

    if (Existing[0] && Existing[0].nom == req.body.nom) {
        return res.status(400).send({ "error": "nom already exists" })
    }

    var query = await Connection.query(`update lieu set nom = "${req.body.nom}" where id = ${req.params.id}`)
    return res.status(200).send({ "id": query.insertId })
})
router.post("/:id/delete", [auth, canWrite], async (req: any, res: any) => {

    if (!req.params.id) {
        return res.status(400).send({ "error": "id is required" })
    }
    var Existing = await Connection.query(`select * from lieu where id = ${req.params.id}`)
    if (!Existing[0]) { return res.status(400).send({ "error": "id doesn't exists" }) }
    
    var query = await Connection.query(`delete from lieu where id = ${req.params.id}`)
    return res.status(200).send({ "id": query.insertId })
})
router.get("/all", [auth, canRead], async (req: any, res: any) => {

    var query = await Connection.query(`select * from lieu`)
    return res.status(200).send(query)
})
router.get("/lieu/:id", [auth, canRead], async (req: any, res: any) => {

    if (!req.params.id) { return res.status(400).send({ "error": "id is required" }) }
    var Existing = await Connection.query(`select * from lieu where id = ${req.params.id}`)
    if (!Existing[0]) { return res.status(400).send({ "error": "id not found" }) }

    var query = await Connection.query(`select * from lieu where id = ${req.params.id}`)
    return res.status(200).send(query)
})
router.get("/lieu/all", [auth, canRead], async (req: any, res: any) => {

    var query = await Connection.query(`select * from lieu`)
    return res.status(200).send(query)
})
router.get("/lieu/:id", [auth, canRead], async (req: any, res: any) => {

    if (!req.params.id) { return res.status(400).send({ "error": "id is required" }) }
    var Existing = await Connection.query(`select * from lieu where id = ${req.params.id}`)
    if (!Existing[0]) { return res.status(400).send({ "error": "id not found" }) }

    var query = await Connection.query(`select * from lieu where id = ${req.params.id}`)
    return res.status(200).send(query)
})

export default router