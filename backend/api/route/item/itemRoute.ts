
import express from "express"
import instance from "../../Connection"
import { FormatNumberLength } from "../../../utils"
const Connection = instance.getInstance()
const router = express.Router()
const auth = require("../../middleware/auth")
const { isAdmin, canRead, canWrite } = require("../../middleware/roles")
const { ItemIntegrity, ItemFKIntegrity } = require("../../middleware/requestIntegrity")

router.get("/inner/all", [auth,canRead], async (req: any, res: any) => {
    var query = await Connection.query(`select item.id as id, materiel.nom as materiel,marque.nom as marque,item.model as modele,item.num_serie,item.num_produit,section.nom as section,
    etat.nom as etat,lieu.nom as lieu,remarque,date_achat,garantie,fin_garantie,prix
        from item inner join section on section_FK=section.id
             inner join materiel on type_material_FK=materiel.id
             inner join etat on etat_FK=etat.id
             inner join marque on marque_FK=marque.id
             inner join lieu on lieu_FK = lieu.id`)
    return res.status(200).send(query)

})
router.get("/all", [auth,canRead], async (req: any, res: any) => {
    var query = await Connection.query(`select * from item`)
    return res.status(200).send(query)

})

router.get("/:id", [auth, canRead], async(req: any, res: any) => {
    try
    {
    var query = await Connection.query(`select item.id as id, materiel.nom as materiel,marque.nom as marque,item.model as modele,item.num_serie,item.num_produit,section.nom as section,
                                            etat.nom as etat,lieu.nom as lieu,remarque,date_achat,garantie,fin_garantie,prix
                                                from item inner join section on section_FK=section.id
                                                     inner join materiel on type_material_FK=materiel.id
                                                     inner join etat on etat_FK=etat.id
                                                     inner join marque on marque_FK=marque.id
                                                     inner join lieu on lieu_FK = lieu.id
                                                     where item.id=${req.params.id}`)
                                                     return res.status(200).send(query)
    }
    catch(error)
    {
        return res.status(500).send({"error":"unvalid id"})
    }

    
})
router.post("/create", [auth, canWrite, ItemIntegrity], async (req: any, res: any) => {

    let year = new Date().getFullYear().toString().substring(2, 3)
    let dblength = await Connection.query(`select count(*) as count from item`)
    let id = `${year}${FormatNumberLength(dblength[0].count + 1, 4)}`
    try
    {
        var query = await Connection.query(`insert into item (id,model,num_serie,num_produit,remarque,date_achat,prix,garantie,fin_garantie,type_material_FK,marque_FK,section_FK,etat_FK,lieu_FK) values 
                                                    ("${id}","${req.body.model}","${req.body.num_serie}","${req.body.num_produit}","${req.body.remarque}","${req.body.date_achat}","${req.body.prix}","${req.body.garantie}","${req.body.fin_garantie}",
                                                    "${req.body.type_material_FK}","${req.body.marque_FK}","${req.body.section_FK}","${req.body.etat_FK}","${req.body.lieu_FK}")`)
        return res.status(200).send(query)
    }
    catch(error)
    {
        console.log(error)
        return res.status(500).send({"error":"sever error"})
    }
})
router.post("/:id/update", [auth, canWrite], async (req: any, res: any) => {
    try
    {
        var query = await Connection.query(`update item set ${Object.keys(req.body).map((key) => `${key} = "${req.body[key]}"`).join(",")} where id = ${req.params.id}`)
        return res.status(200).send({ "id": query.insertId })
    }
    catch(e)
    {
        console.log(e)
        return res.status(400).send({"error":"invalid request"})
    }
})

router.post("/:id/delete", [auth, canWrite], async (req: any, res: any) => {
    var query = await Connection.query(`delete from item where id = ${req.params.id}`)
    return res.status(200).send({ "id": query.insertId })
})
router.post("/byValues", [auth, canRead], async (req: any, res: any) => {

    if(req.body == "")
    {
        return res.status(200).send([])
    }
    var joinAnd = false
    var end = ")"
    var start = "("
    var whereCondition = Object.keys(req.body).map((key) => {
        return req.body[key].values.map((value: any) => {
            // test if it's the last value
            if (value == req.body[key].values[req.body[key].values.length - 1] && req.body[key].values.length > 1)
            {
                end = ")"
            }
            else
            {
                end = ""
            }
            // test if it's the start of the query
            if (value == req.body[key].values[0] && req.body[key].values.length > 1)
            {
                start = "("
            }
            else
            {
                start = ""
            }


            if(value.checked)
            {
                joinAnd = true
                return (`${start} ${req.body[key].name} = "${value.nom}" ${end}`)
            }
            else
            {
                joinAnd = false
            }
        }
        ).join(" or ")
    }).join(end == ")" ? " and " : "")
    console.log(whereCondition)
    var query = await Connection.query(`select item.id as id, materiel.nom as materiel,marque.nom as marque,item.model as modele,item.num_serie,item.num_produit,section.nom as section,
    etat.nom as etat,lieu.nom as lieu,remarque,date_achat,garantie,fin_garantie,prix
        from item inner join section on section_FK=section.id
             inner join materiel on type_material_FK=materiel.id
             inner join etat on etat_FK=etat.id
             inner join marque on marque_FK=marque.id
             inner join lieu on lieu_FK = lieu.id
             where ${whereCondition}`)
    return res.status(200).send(query)
})

export default router