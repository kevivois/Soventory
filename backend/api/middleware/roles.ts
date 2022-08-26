import Instance from "../Connection"
const Connection = Instance.getInstance()
export async function isAdmin(req:any,res:any,next:any) : Promise<void>
{
    let droit = await Connection.query(`select * from utilisateur inner join droit on droit_FK=droit.id where utilisateur.id = ${req.body.id}`)
    if(droit[0] && droit[0].droit == "ADMINISTRATEUR")
    {
        return next()
    }
    else
    {
        res.status(401).send({"error":"you are not allowed to do this action"})
    }
}
export async function canRead(req:any,res:any,next:any) : Promise<void>
{
    let droit = await Connection.query(`select * from utilisateur inner join droit on droit_FK=droit.id where utilisateur.id = ${req.body.id}`)

    if(droit[0] && (droit[0].droit == "LIRE" || droit[0].droit == "ADMINISTRATEUR" || droit[0].droit == "ECRIRE"))
    {
        return next()
    }
    else
    {
        return res.status(401).send({"error":"you are not allowed to do this action"})
    }
}
export async function canWrite(req:any,res:any,next:any) : Promise<void>
{
    let droit = await Connection.query(`select * from utilisateur inner join droit on droit_FK=droit.id where utilisateur.id = ${req.body.id}`)

    if(droit[0] && (droit[0].droit == "ECRIRE" || droit[0].droit == "ADMINISTRATEUR"))
    {
        return next()
    }
    else
    {
        return res.status(401).send({"error":"you are not allowed to do this action"})
    }
}
