
import express from "express"
import instance from "../../Connection"
import { FormatNumberLength } from "../../../utils"
import { gunzipSync } from "zlib"
import { createItem } from "../../utils/DB.utils"
import fs from "fs"
import headers from "../../../../soventory_frontend/src/components/headers"
const Connection = instance.getInstance()
const router = express.Router()
const auth = require("../../middleware/auth")
const { isAdmin, canRead, canWrite } = require("../../middleware/roles")
const { ItemIntegrity, ItemFKIntegrity } = require("../../middleware/requestIntegrity")

const sortedById = "order by (SELECT SUBSTRING(item.id,3,5))"

function renderJsDates(query:any[]){
    var result:any = []
    query.forEach((element:any) => {
        var newElement = {...element}
      //render to YYYY.MM.DD
        newElement.date_achat = new Date(element.date_achat).toLocaleDateString()
        newElement.fin_garantie =  new Date(element.fin_garantie).toLocaleDateString()
        result.push(newElement)
    });
    return result
}
function formatToDBDate(date:string){
        
    let splitted = date.split('.');
    if(splitted.length >1){
    let day = splitted[0];
    let month = splitted[1];
    let year = splitted[2];
    let returnContent =  `${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`
    console.log(returnContent)
    return returnContent;
    }else{
        return date;
    }
    
}
router.get("/inner/all", [auth,canRead], async (req: any, res: any) => {
    var query = await Connection.query(`select item.id as id, materiel.nom as materiel,marque.nom as marque,item.modele as modele,item.num_serie,item.num_produit,section.nom as section,
    etat.nom as etat,lieu.nom as lieu,remarque,date_achat,garantie,fin_garantie,prix,archive
        from item inner join section on section_FK=section.id
             inner join materiel on materiel_FK=materiel.id
             inner join etat on etat_FK=etat.id
             inner join marque on marque_FK=marque.id
             inner join lieu on lieu_FK = lieu.id
             where archive=0 ${sortedById}`)
    query = renderJsDates(query)
    return res.status(200).send(query)

})
router.get("/all", [auth,canRead], async (req: any, res: any) => {
    var query = await Connection.query(`select * from item where archive=0`)
    query = renderJsDates(query)
    return res.status(200).send(query)

})

router.get("/:id", [auth, canRead], async(req: any, res: any) => {
    try
    {
    var query = await Connection.query(`select item.id as id, materiel.nom as materiel,marque.nom as marque,item.modele as modele,item.num_serie,item.num_produit,section.nom as section,
                                            etat.nom as etat,lieu.nom as lieu,remarque,date_achat,garantie,fin_garantie,prix,archive
                                                from item inner join section on section_FK=section.id
                                                     inner join materiel on materiel_FK=materiel.id
                                                     inner join etat on etat_FK=etat.id
                                                     inner join marque on marque_FK=marque.id
                                                     inner join lieu on lieu_FK = lieu.id
                                                     where item.id=${req.params.id}`)
                                                     query = renderJsDates(query)
                                                     return res.status(200).send(query)
    }
    catch(error)
    {
        return res.status(500).send({"error":"unvalid id"})
    }

    
})
router.post("/create", [auth, canWrite, ItemIntegrity], async (req: any, res: any) => {

    const {success,query} = await createItem(req.body.item);
    if(success)
    {
        return res.status(200).send({"id":query})
    }
    else
    {
        return res.status(500).send({"error":"server error"})
    }
})
router.post("/:id/update", [auth, canWrite,ItemIntegrity], async (req: any, res: any) => {
    try
    {
                var body = req.body
                body.prix = Math.round(parseFloat(body.prix) * 20) / 20.0
                var queryCondition = Object.keys(body).map((key) => {
                    var bd = body[key];
                    if(key == "date_achat" || key == "fin_garantie")
                    {
                       // return bd = `item.${key} = ${bd}`
                    }
                    return  `item.${key} = '${bd}'`

                }).join(",")
                //console.log(queryCondition)
                var query = await Connection.query(`update item inner join section on section_FK=section.id
                inner join materiel on materiel_FK=materiel.id
                inner join etat on etat_FK=etat.id
                inner join marque on marque_FK=marque.id
                inner join lieu on lieu_FK = lieu.id
                set ${queryCondition} where item.id = ${req.params.id}`)

                console.log("success")
                return res.status(200).send({ "id": query })
            }
        catch(e:any)
        {
            console.log(e)
            return res.status(400).send({"error":"invalid request"})
        }
})

router.post("/:id/delete", [auth,canWrite], async (req: any, res: any) => {
    try
    {

    
    var query = await Connection.query(`delete from item where id = ${req.params.id}`)
    return res.status(200).send({ "id": query.insertId })
    }
    catch(e){
    console.log(`Error while deleting item ${req.params.id}`)
       return res.status(400).send({"error":"cannot delete id "+req.params.id})
    }
})
router.post("/byValues", [auth, canRead], async (req: any, res: any) => {

    var end = ")"
    var start = "("
    var whereCondition = "where" + Object.keys(req.body).map((key) => {
        return req.body[key].values.map((value: any) => {
            // test if it's the last value
            if (value == req.body[key].values[req.body[key].values.length - 1] && req.body[key].values.length > 1)
            {
                end = ")"
            }
            else
            {
                end = ""
            }
            // test if it's the start of the query
            if (value == req.body[key].values[0] && req.body[key].values.length > 1)
            {
                start = "("
            }
            else
            {
                start = ""
            }

                return (`${start} ${req.body[key].name} = "${value.nom}" ${end}`)

        }
        ).join(" or ")
    }).join(`and`)
    if(req.body == "")
    {
        whereCondition = "where archive = 0";
    }
    else
    {
        whereCondition += "and archive = 0"
    }
    var query = await Connection.query(`select item.id as id, materiel.nom as materiel,marque.nom as marque,item.modele as modele,item.num_serie,item.num_produit,section.nom as section,
    etat.nom as etat,lieu.nom as lieu,remarque,date_achat,garantie,fin_garantie,prix,archive
        from item inner join section on section_FK=section.id
             inner join materiel on materiel_FK=materiel.id
             inner join etat on etat_FK=etat.id
             inner join marque on marque_FK=marque.id
             inner join lieu on lieu_FK = lieu.id
             ${whereCondition} ${sortedById}`)
             query = renderJsDates(query)
    return res.status(200).send(query)
})

router.post("/archived/byValues", [auth, canRead], async (req: any, res: any) => {

    var end = ")"
    var start = "("
    var whereCondition = "where" + Object.keys(req.body).map((key) => {
        return req.body[key].values.map((value: any) => {
            // test if it's the last value
            if (value == req.body[key].values[req.body[key].values.length - 1] && req.body[key].values.length > 1)
            {
                end = ")"
            }
            else
            {
                end = ""
            }
            // test if it's the start of the query
            if (value == req.body[key].values[0] && req.body[key].values.length > 1)
            {
                start = "("
            }
            else
            {
                start = ""
            }

                return (`${start} ${req.body[key].name} = "${value.nom}" ${end}`)

        }
        ).join(" or ")
    }).join(`and`)
    if(req.body == "")
    {
        whereCondition = "where archive = 1";
    }
    else
    {
        whereCondition += "and archive = 1"
    }
    var query = await Connection.query(`select item.id as id, materiel.nom as materiel,marque.nom as marque,item.modele as modele,item.num_serie,item.num_produit,section.nom as section,
    etat.nom as etat,lieu.nom as lieu,remarque,date_achat,garantie,fin_garantie,prix,archive
        from item inner join section on section_FK=section.id
             inner join materiel on materiel_FK=materiel.id
             inner join etat on etat_FK=etat.id
             inner join marque on marque_FK=marque.id
             inner join lieu on lieu_FK = lieu.id
             ${whereCondition}`)
             query = renderJsDates(query)
    return res.status(200).send(query)
})
router.get("/archived/inner/all", [auth, canRead], async (req: any, res: any) => {
    var query = await Connection.query(`select item.id as id, materiel.nom as materiel,marque.nom as marque,item.modele as modele,item.num_serie,item.num_produit,section.nom as section,
    etat.nom as etat,lieu.nom as lieu,remarque,date_achat,garantie,fin_garantie,prix,archive
        from item inner join section on section_FK=section.id
             inner join materiel on materiel_FK=materiel.id
             inner join etat on etat_FK=etat.id
             inner join marque on marque_FK=marque.id
             inner join lieu on lieu_FK = lieu.id
             where archive = 1 ${sortedById}`);
             query = renderJsDates(query)
    return res.status(200).send(query);
})
export default router

router.post("/import", [auth, canWrite], async (req: any, res: any) => {
    let array:any[] = req.body.items;
    let sqlArray:any[] = [];
    let errors:any = []
    if(!array)
    {
        errors.push("pas de liste d'items")
        return res.status(400).send({errors:errors})
    }
    // step 1 : convert all FK to id, if not found, create it
    const promises : readonly unknown[] = array.map(async (item:any) => {
        let sqlItem:typeof item = {}
        const promises : readonly unknown[] =  Object.keys(item).map(async (key) => {
            if(headers.find((k:any) => k.key == String(key) && k.inner == true && k.required == true) !== undefined)
            {
                var query = await Connection.query(`select id from ${key} where nom = "${item[key]}"`)
                if(query.length == 0)
                {
                    var query = await Connection.query("insert into " + key + " (nom) values ('" + item[key] + "')")
                    var lastId = await Connection.query("select id from " + key + " order by id desc limit 1")
                    item[`${key}_FK`] = lastId;
                    sqlItem[`${key}_FK`] = lastId;
                }
                else{
                    item[`${key}_FK`] = query[0].id
                    sqlItem[`${key}_FK`] = query[0].id
                }
            }else if(item[key] === undefined || item[key] === ""){
                errors.push("l'item " + item.id + " n'a pas de " + key)
            }
            else{
                
                sqlItem[key] = item[key]
            }
        })
        await Promise.all(promises)
        sqlArray.push(sqlItem)
    })
    await Promise.all(promises)

    // step 2 : insert all items$
    const insertPromises : readonly unknown[] = sqlArray.map(async (item:any) => {
        if(item.id !== undefined)
        {
            // delete from the item the id
            delete item.id;
        }
            item.date_achat = formatToDBDate(item.date_achat)
            item.fin_garantie = formatToDBDate(item.fin_garantie)
            let {success,query,currentId} = await createItem(item)
            if(!success)
            {
                if(currentId){
                    errors.push("l'item " + currentId + " n'a pas pu être créé")
                }else{
                    errors.push("l'item  n'a pas pu être créé")              
                }
            }
    })
    await Promise.all(insertPromises)
    if(errors.length == 0)
    {
        return res.status(200).send({errors:errors})
    }
    return res.status(400).send({errors:errors})
});
