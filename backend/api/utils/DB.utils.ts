import { FormatNumberLength } from "../../utils"
import instance from "../Connection"
const Connection = instance.getInstance()
import { checkDestructedItem } from "../middleware/requestIntegrity"
export async function createItem(item:any,newId=true){
    
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
    if(!newId){
        id = item.id;
    }
    let prix = Math.round(parseFloat(item.prix) * 20) / 20.0
    item.date_achat = formatToDBDate(item.date_achat)
    item.fin_garantie = formatToDBDate(item.fin_garantie)
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
export async function updateItem(item:any){

    var queryCondition = Object.keys(item).map((key) => {
        var bd = item[key];
        if(key == "date_achat" || key == "fin_garantie")
        {
           return `item.${key} = '${formatToDBDate(bd)}'`
        }else{
        return  `item.${key} = '${bd}'`
        }

    }).join(",")
    try{
    var query = await Connection.query(`update item inner join section on section_FK=section.id
    inner join materiel on materiel_FK=materiel.id
    inner join etat on etat_FK=etat.id
    inner join marque on marque_FK=marque.id
    inner join lieu on lieu_FK = lieu.id
    set ${queryCondition} where item.id = ${item.id}`)

    return{success:true,query:query}
    }
    catch(error)
    {
        console.log(error)
        return{success:false,query:query,errors:[error]}
    }

}
export function formatToDBDate(date:any){
    let splitted = String(date).split('.');
    if(splitted.length >1){
    let day = splitted[0];
    let month = splitted[1];
    let year = splitted[2];
    let returnContent =  `${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`
    return returnContent;
    }else{
        return date;
    }
    
}
