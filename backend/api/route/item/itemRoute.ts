
import express from "express"
import instance from "../../Connection"
import { FormatNumberLength } from "../../../utils"
import { gunzipSync } from "zlib"
import { createItem } from "../../utils/DB.utils"
import fs from "fs"
import headers from "../../../../soventory_frontend/src/components/headers"
import Moment from 'moment'
const Connection = instance.getInstance()
const router = express.Router()
const auth = require("../../middleware/auth")
const { isAdmin, canRead, canWrite } = require("../../middleware/roles")
const { ItemIntegrity, ItemFKIntegrity } = require("../../middleware/requestIntegrity")
import {formatToDBDate,updateItem} from "../../utils/DB.utils"

const sortedById = "order by item.id asc"

function renderJsDates(query:any[]){
    var result:any = []
    query.forEach((element:any) => {
        var newElement = {...element}
      //render to local date
        newElement.date_achat = new Date(element.date_achat).toLocaleDateString("fr-FR")
        newElement.fin_garantie =  new Date(element.fin_garantie).toLocaleDateString("fr-FR")
        result.push(newElement)
    });
    return result
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
    let item = {...req.body}
    const {success,query} = await createItem(item);
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
                let item = {...body}
                item.id = req.params.id
                let {success,query,errors} = await updateItem(item);
                let code = success ? 200 : 500
                if(errors){
                    return res.status(code).send({"errors":errors})
                }else{
                    return res.status(code).send({ "id": query})
                }
    }
    catch(e)
    {
        return res.status(500).send({"error":"server error"})
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
        let enable = true;
        const Itempromise : readonly unknown[] =  Object.keys(item).map(async (key) => {
            let header = headers.find((k:any) => k.key == String(key) );
            
            if(header !== undefined && header.required)
            {
                if(item[key] === undefined || item[key] == null || item[key] == ""){
                    return enable = false;
                }
                if(header.inner == true){
                    var query = await Connection.query(`select id from ${key} where nom = "${item[key]}"`)
                    if(query.length == 0)
                    {   try{
                            var query = await Connection.query("insert into " + key + " (nom) values ('" + item[key] + "')")
                    }catch(e){}
                        var lastId = await Connection.query("select id from " + key + " order by id desc limit 1")
                        item[`${key}_FK`] = lastId[0].id;
                        sqlItem[`${key}_FK`] = lastId[0].id;
                    }
                    else{
                        item[`${key}_FK`] = query[0].id
                        sqlItem[`${key}_FK`] = query[0].id
                    }
                }else{
                    sqlItem[key] = item[key];
                } 
            }else{
                sqlItem[key] = item[key];
            }
        })
        await Promise.all(Itempromise).then(() => {
            if(enable == true){
                sqlArray.push(sqlItem);
            };
        })
    })
    await Promise.all(promises)

    // step 2 : insert all items$
    const insertPromises : readonly unknown[] = sqlArray.map(async (item:any) => {
        if(!item)return;
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
                    errors.push("l'item " + currentId + " n'a pas pu ??tre cr????")
                }else{
                    errors.push("l'item  n'a pas pu ??tre cr????")              
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


router.get("/FK/all", [auth, canRead], async (req: any, res: any) => {
    let data: any[] = [];

    
    const requestPromises : readonly unknown[] = headers.map(async (header:any) => {
        if(header.inner == true){
            var query = await Connection.query(`select id,nom from ${header.key}`)
            data.push({key:header.key,values:query})
        }
    })
    
    await Promise.all(requestPromises)
    return res.status(200).send(data)
})
