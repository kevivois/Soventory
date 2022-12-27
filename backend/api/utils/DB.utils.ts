import { FormatNumberLength } from "../../utils"
import instance from "../Connection"
const Connection = instance.getInstance()
import { checkDestructedItem } from "../middleware/requestIntegrity"
export async function createItem(item:any){
    
    await Connection.wait();
    await checkDestructedItem(item);
    let year = new Date(Date.now()).getFullYear().toString().substring(2, 4)
    let dblength = await Connection.query(`select (select SUBSTRING(id,3,5)) as count from item where SUBSTRING(id,3,5) = (select max((select SUBSTRING(id,3,5))) from item)`)
    let id = `${year}${FormatNumberLength(parseInt(dblength[0].count) + 1, 3)}`
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