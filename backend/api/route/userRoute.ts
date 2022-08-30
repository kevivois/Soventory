
import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import instance from "../Connection"
import {getRightOfUser} from "../utils/item.utils"
const Connection = instance.getInstance()
const router = express.Router()
const env = require("../../env.json")
const { isAdmin, canRead, canWrite } = require("../middleware/roles")
import { verifyJWT, signJWT } from "../utils/token.utils"
const auth = require("../middleware/auth")

router.get("/me",[auth],async (req:any,res:any)=>{
    const {id} = req.user
    const user = await Connection.query(`SELECT utilisateur.id,nom_utilisateur,mot_de_passe,name as droit FROM utilisateur inner join droit on droit_FK=droit.id WHERE utilisateur.id = ${id}`)
    res.send(user[0])
})
router.post("/me/update",[auth],async(req:any,res:any) => {
    const {id} = req.user
    const {nom_utilisateur,mot_de_passe} = req.body
    if(nom_utilisateur && mot_de_passe)
    {
      const encryptedPassword = await bcrypt.hash(mot_de_passe,10)
      const occurence = await Connection.query(`select * from utilisateur where nom_utilisateur='${nom_utilisateur}'`)
      if(occurence.length > 0)
      {
        return res.status(400).send({"error":"Ce nom d'utilisateur existe déjà"})
      }
      const user = await Connection.query(`UPDATE utilisateur SET nom_utilisateur='${nom_utilisateur}',mot_de_passe='${encryptedPassword}' WHERE id=${id}`)
      return res.status(201).send({user})
    }
    else if(nom_utilisateur)
    {
      const occurence = await Connection.query(`select * from utilisateur where nom_utilisateur='${nom_utilisateur}'`)
      if(occurence.length > 0)
      {
        return res.status(400).send({"error":"Ce nom d'utilisateur existe déjà"})
      }
      const user = await Connection.query(`UPDATE utilisateur SET nom_utilisateur='${nom_utilisateur}' WHERE id=${id}`)
      return res.status(201).send({user})
    }else if(mot_de_passe)
    {
      const encryptedPassword = await bcrypt.hash(mot_de_passe,10)
      const user = await Connection.query(`UPDATE utilisateur SET mot_de_passe='${encryptedPassword}' WHERE id=${id}`)
      return res.status(201).send({user})
    }
    return res.status(400).send({"error":"Missing parameters"})

})
router.post("/:id/update",[auth,isAdmin],async(req:any,res:any) => {
    const {nom_utilisateur,mot_de_passe,droit_FK} = req.body
    const {id} = req.params
    if(nom_utilisateur && mot_de_passe && droit_FK)
    {
      const encryptedPassword = await bcrypt.hash(mot_de_passe,10)
      const occurence = await Connection.query(`select * from utilisateur where nom_utilisateur='${nom_utilisateur}'`)
      if(occurence.length > 0)
      {
        return res.status(400).send({"error":"Ce nom d'utilisateur existe déjà"})
      }
      const user = await Connection.query(`UPDATE utilisateur SET nom_utilisateur='${nom_utilisateur}',mot_de_passe='${encryptedPassword}',droit_FK=${droit_FK} WHERE id=${id}`)
      return res.status(201).send({user})
    }
    else if(nom_utilisateur && droit_FK)
    {
      const occurence = await Connection.query(`select * from utilisateur where nom_utilisateur='${nom_utilisateur}'`)
      if(occurence.length > 0)
      {
        return res.status(400).send({"error":"Ce nom d'utilisateur existe déjà"})
      }
      const user = await Connection.query(`UPDATE utilisateur SET nom_utilisateur='${nom_utilisateur}',droit_FK=${droit_FK} WHERE id=${id}`)
      return res.status(201).send({user})
    }else if(mot_de_passe && droit_FK)
    {
      const encryptedPassword = await bcrypt.hash(mot_de_passe,10)
      const user = await Connection.query(`UPDATE utilisateur SET mot_de_passe='${encryptedPassword}',droit_FK=${droit_FK} WHERE id=${id}`)
      return res.status(201).send({user})
    }
})
router.post(":id/delete",[auth,isAdmin],async(req:any,res:any) => {
    const {id} = req.params
    const user = await Connection.query(`DELETE FROM utilisateur WHERE id=${id}`)
    return res.status(201).send({user})
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
    return res.status(400).send({"error":"Missing parameters"})
  }

  var user:any = await Connection.query(`select * from utilisateur where nom_utilisateur="${req.body.nom_utilisateur}"`)
  if(user[0])
  {
    var Logged = bcrypt.compareSync(req.body.mot_de_passe,user[0].mot_de_passe)

    if (!Logged)
    {
      return res.status(400).send({"error":"Wrong password or email"})
    }
    var droit = await getRightOfUser(user[0].id)
    var accessToken = signJWT({id:user[0].id,droit:droit},"1m")
    var refreshToken = signJWT({id:user[0].id},undefined)
    console.log(String(refreshToken).length)
    //adding refresh token to database
    await Connection.query(`insert into refreshtoken (token,utilisateur_FK) values ("${refreshToken}","${user[0].id}")`)

    // saving into cookies
    res.cookie("refreshToken",refreshToken,{httpOnly:true})
    res.cookie("accessToken",accessToken,{httpOnly:true})
    return res.status(200).send({user:user[0],droit:droit,refreshToken:refreshToken,accessToken:accessToken})
  }
  return res.status(400).send({"error":"Wrong password or email"})
})
router.post("/logout",[auth],async(req:any,res:any) => {
  await Connection.query(`delete from refreshtoken where token="${req.cookies.refreshToken}"`)
  res.clearCookie("refreshToken")
  res.clearCookie("accessToken")
  return res.status(200).send({"message":"Logged out"})
})
router.get("/get/:id",[isAdmin],async(req:any,res:any) => {
  
  var result = await Connection.query(`select * from utilisateur where id=${req.params.id}`)
  
  return res.status(202).json(result)

})
export default router;