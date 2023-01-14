import ConnectionInstance from "../Connection"
const Connection = ConnectionInstance.getInstance()
import Headers from "../../../soventory_frontend/src/components/headers"

export  function ItemIntegrity(req:any, res:any, next:any) {

    let item = req.body
    let errors = []

    if(!item.materiel_FK)
    {
        errors.push("le champ 'materiel' est requis")
    }
    if(!item.marque_FK)
    {
        errors.push("le champ 'marque' est requis")
    }
    if(!item.modele || item.modele == "")
    {
        errors.push("le champ 'modele' est requis")
    }
    if(!item.num_serie || item.num_serie == "")
    {
        errors.push("le champ 'num_serie' est requis")
    }
    if(!item.num_produit)
    {
        errors.push("le champ 'num_produit' est requis")
    }
    if(!item.section_FK)
    {
        errors.push("le champ 'section' est requis")
    }
    if(!item.etat_FK)
    {
        errors.push("le champ 'etat' est requis")
    }
    if(!item.lieu_FK)
    {
        errors.push("le champ 'lieu' est requis")
    }
    if(!item.date_achat)
    {
        errors.push("le champ 'date_achat' est requis")
    }
    if(!item.garantie)
    {
        errors.push("le champ 'garantie' est requis")
    }
    if(!item.fin_garantie)
    {
        errors.push("le champ 'fin_garantie' est requis")
    }
    if(!item.prix || item.prix == "" || item.prix == "NaN")
    {
        errors.push("le champ 'prix' est requis")
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
    let type_material = await Connection.query(`select * from materiel where id = ${item.materiel_FK}`)
    let marque = await Connection.query(`select * from marque where id = ${item.marque_FK}`)
    let section = await Connection.query(`select * from section where id = ${item.section_FK}`)
    let etat = await Connection.query(`select * from etat where id = ${item.etat_FK}`)
    let lieu = await Connection.query(`select * from lieu where id = ${item.lieu_FK}`)
    if(!type_material[0])
    {
        errors.push("materiel_FK is not valid")
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
export async function checkDestructedItem(item:any){
    let FK_destructed:any[] = await Connection.query(`select id from etat where nom = "detruit" or nom = "détruit"`)
    if(FK_destructed.length > 0 && FK_destructed[0].id && item &&  item.etat_FK){
        if(item.etat_FK == FK_destructed[0].id){
            return item.archive = 1;
        }
        else{
            return item.archive = 0;
        }
    }
    return;
}