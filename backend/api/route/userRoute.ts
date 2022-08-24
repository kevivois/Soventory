import { dir } from "console"
import express from "express"
import instance from "../Connection"
const Connection = instance.getInstance()
const router = express.Router()

router.get("/:id",async(req,res) => {
  
  var result = await Connection.query(`select * from utilisateur where id=${req.params.id}`)
  
  return res.status(202).json(result)

})
router.get("/name/():username",async(req,res) => {

  var result = await Connection.query(`select * from utilisateur where nom_utilisateur="${req.params.username}"`)
  return res.status(202).json(result)

})
router.post("/create",async(req,res) => {
  try
  {

    if(!req.body.droit || !req.body.nom_utilisateur || !req.body.mot_de_passe)
    {
      
      throw new Error("undefined variables in body")
    }
    var droit = await Connection.query(`select id from droit where name="${req.body.droit}"`)

    var isExisting = await Connection.query(`select id from utilisateur where nom_utilisateur="${req.body.nom_utilisateur}"`)

    if(isExisting[0].id)
    {
      throw new Error("user already existing")
    }
    var result = await Connection.query(`insert into utilisateur (nom_utilisateur,mot_de_passe,droit_FK) values ("${req.body.nom_utilisateur}","${req.body.mot_de_passe}","${droit[0].id}")`)
    return res.sendStatus(201)
  }
  catch(error)
  {
   console.log(error)
    return res.sendStatus(400)
  }
  
})
router.post("/login",async(req,res) => {
  if(!req.body.nom_utilisateur || !req.body.mot_de_passe)
  {
    throw new Error("undefined variables in body")
  }

  var isExisting = await Connection.query(`select * from utilisateur where nom_utilisateur="${req.body.nom_utilisateur}" and mot_de_passe="${req.body.mot_de_passe}"`)

  var logged = isExisting[0] ? true : false
  var status = isExisting[0] ? 200 : 400

  return res.status(status).json({"logged":logged})
  

})

export default router;