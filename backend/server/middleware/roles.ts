import Instance from "../Connection"
import jwt from "jsonwebtoken"
const env = require("../../env.json")
const Connection = Instance.getInstance()
export function isAdmin(req:any,res:any,next:any) : void
{   
    let droit = req.user.droit

    if(droit && droit == "ADMINISTRATEUR")
    {
        return next()
    }
    else
    {
        res.status(401).send({"error":"tu n'as pas la permission d'effecteur cette action"})
    }
}
export function canRead(req:any,res:any,next:any) : void
{
   
    let droit = req.user.droit
    if(droit && (droit == "LIRE" || droit == "ADMINISTRATEUR" || droit == "ECRIRE"))
    {
        return next()
    }
    else
    {
        return res.status(401).send({"error":"tu n'as pas la permission d'effecteur cette action"})
    }
}
export function canWrite(req:any,res:any,next:any) : void
{   
    
    let droit = req.user.droit
    
    if(droit && (droit == "ECRIRE" || droit == "ADMINISTRATEUR"))
    {
        return next()
    }
    else
    {
        return res.status(401).send({"error":"tu n'as pas la permission d'effecteur cette action"})
    }
}
