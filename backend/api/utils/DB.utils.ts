import { FormatNumberLength } from "../../utils"
import instance from "../Connection"
const Connection = instance.getInstance()
import { checkDestructedItem } from "../middleware/requestIntegrity"
export async function createItem(item:any){
    
    await Connection.wait();
    await checkDestructedItem(item);
    let year = new Date(Date.now()).getFullYear().toString().substring(2, 4)
    let queryNextId = await Connection.query(`select SUBSTRING(id,3,5) as nextId from item where item.id >= ${parseInt(year)*1000} order by item.id desc limit 1`)
    let nextId=0;
    if(queryNextId.length>0)
    {
        nextId = parseInt(queryNextId[0].nextId)+1;
    }

    let id = `${year}${FormatNumberLength(nextId, 3)}`
    let prix = Math.round(parseFloat(item.prix) * 20) / 20.0
    try
    {
        var query = await Connection.query(`insert into item (id,modele,num_serie,num_produit,remarque,date_achat,prix,garantie,fin_garantie,materiel_FK,marque_FK,section_FK,etat_FK,lieu_FK,archive) values 
                                                    ("${id}","${item.modele}","${item.num_serie}","${item.num_produit}","${item.remarque}","${item.date_achat}","${prix}","${item.garantie}","${item.fin_garantie}",
                                                    "${item.materiel_FK}","${item.marque_FK}","${item.section_FK}","${item.etat_FK}","${item.lieu_FK}","${item.archive}")`)
        return {success:true,query:query,currentId:id}
    }
    catch(error)
    {
        console.log(error)
        return {success:false,query:query,currentId:id}
    }

}