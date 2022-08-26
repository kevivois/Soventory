
import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import instance from "../Connection"
const Connection = instance.getInstance()
const router = express.Router()
const env = require("../../env.json")
const { isAdmin, canRead, canWrite } = require("../middleware/roles")

router.get("/:id",[isAdmin],async(req:any,res:any) => {
  
  var result = await Connection.query(`select * from utilisateur where id=${req.params.id}`)
  
  return res.status(202).json(result)

})
router.get("/name/:username",[isAdmin],async(req:any,res:any) => {

  var result = await Connection.query(`select * from utilisateur where nom_utilisateur="${req.params.username}"`)
  return res.status(202).json(result)

})
router.post("/create",async(req:any,res:any) => {
  try
  {

    if(!req.body.droit || !req.body.nom_utilisateur || !req.body.mot_de_passe)
    {
      
      throw new Error("undefined variables in body")
    }
    var droit = await Connection.query(`select id from droit where name="${req.body.droit}"`)
    console.log(droit)
    var isExisting = await Connection.query(`select id from utilisateur where nom_utilisateur="${req.body.nom_utilisateur}"`)

    if(isExisting.length > 0)
    {
      throw new Error("user already existing")
    }
    var password = bcrypt.hashSync(req.body.mot_de_passe,10)
    var result = await Connection.query(`insert into utilisateur (nom_utilisateur,mot_de_passe,droit_FK) values ("${req.body.nom_utilisateur}","${password}","${droit[0].id}")`)
    return res.status(201).send({id:result.insertId})
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

  var user = await Connection.query(`select * from utilisateur where nom_utilisateur="${req.body.nom_utilisateur}"`)
  if(user[0])
  {
    var Logged = bcrypt.compareSync(req.body.mot_de_passe,user[0].mot_de_passe)

    if (!Logged)
    {
      throw new Error("invalid password or username")
    }
    var droit = await getRightOfUser(user[0].id)
    var token = generateAccessToken(user[0].nom_utilisateur,user[0].id,droit[0].droit)
    return res.status(200).json({
      "user":user[0],
      "token":token})
  }
  return res.sendStatus(400)
  

})


function generateAccessToken(name:string,id:number,droit:string) : string
{
  return jwt.sign({name:name,id:id,droit:droit},env.TOKEN_SECRET,{expiresIn:"1800s"})
}

async function getRightOfUser(id:string)
{
  var result = await Connection.query(`Select * from utilisateur inner join droit on droit.id = droit_FK where utilisateur.id=${id}`)
  console.log(result)
  return result
}

export default router;