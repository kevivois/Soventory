import Instance from "../Connection"
const Connection = Instance.getInstance()
export async function isAdmin(req:any,res:any,next:any) : Promise<boolean>
{
    let droit = await Connection.query(`select droit from utilisateur inner join droit on droit_FK=droit.id where utilisateur.id = ${req.body.id}`)
    if(droit[0].droit == "ADMINISTRATEUR")
    {
        return true
    }
    else
    {
        return false
    }
}
export async function canRead(req:any,res:any,next:any) : Promise<boolean>
{
    let droit = await Connection.query(`select droit from utilisateur inner join droit on droit_FK=droit.id where utilisateur.id = ${req.body.id}`)

    if(droit[0].droit == "LIRE")
    {
        return true
    }
    else
    {
        return false
    }
}
export async function canWrite(req:any,res:any,next:any) : Promise<boolean>
{
    let droit = await Connection.query(`select droit from utilisateur inner join droit on droit_FK=droit.id where utilisateur.id = ${req.body.id}`)

    if(droit[0].droit == "ECRIRE")
    {
        return true
    }
    else
    {
        return false
    }
}
