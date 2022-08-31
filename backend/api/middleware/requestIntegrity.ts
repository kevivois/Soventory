import ConnectionInstance from "../Connection"
const Connection = ConnectionInstance.getInstance()

export  function ItemIntegrity(req:any, res:any, next:any) {

    let item = req.body
    let errors = []

    if(!item.type_material_FK)
    {
        errors.push("type_material_FK is required")
    }
    if(!item.marque_FK)
    {
        errors.push("marque_FK is required")
    }
    if(!item.model || item.model == "")
    {
        errors.push("model is required")
    }
    if(!item.num_serie || item.num_serie == "")
    {
        errors.push("num_serie is required")
    }
    if(!item.num_produit)
    {
        errors.push("num_produit is required")
    }
    if(!item.section_FK)
    {
        errors.push("section_FK is required")
    }
    if(!item.etat_FK)
    {
        errors.push("etat_FK is required")
    }
    if(!item.lieu_FK)
    {
        errors.push("lieu_FK is required")
    }
    if(!item.date_achat)
    {
        errors.push("date_achat is required")
    }
    if(!item.garantie)
    {
        errors.push("garantie is required")
    }
    if(!item.fin_garantie)
    {
        errors.push("fin_garantie is required")
    }
    if(!item.prix)
    {
        errors.push("prix is required")
    }
    if(errors.length > 0)
    {
        return res.status(400).send({"errors":errors})
    }
    else
    {
        return next()
    }
    
}
export async function ItemFKIntegrity(req:any,res:any,next:any)
{
    let item = req.body
    let errors = []
    let type_material = await Connection.query(`select * from materiel where id = ${item.type_material_FK}`)
    let marque = await Connection.query(`select * from marque where id = ${item.marque_FK}`)
    let section = await Connection.query(`select * from section where id = ${item.section_FK}`)
    let etat = await Connection.query(`select * from etat where id = ${item.etat_FK}`)
    let lieu = await Connection.query(`select * from lieu where id = ${item.lieu_FK}`)
    if(!type_material[0])
    {
        errors.push("type_material_FK is not valid")
    }
    if(!marque[0])
    {
        errors.push("marque_FK is not valid")
    }
    if(!section[0])
    {
        errors.push("section_FK is not valid")
    }
    if(!etat[0])
    {
        errors.push("etat_FK is not valid")
    }
    if(!lieu[0])
    {
        errors.push("lieu_FK is not valid")
    }
    if(errors.length > 0)
    {
        return res.status(400).send({"errors":errors})
    }
    else
    {
        return next()
    }
}