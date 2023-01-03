import Inventory from "../components/InventoryTable"
import Archives from "../components/ArchiveTable"
import React from 'react';
import { useState,useEffect } from "react";
import getIp from "../IP";
const types = {
    archive: "archive",
    inventory: "inventory",
    unknown: "unknown"
}
export default function  TablePage(props:{user:any,type:string})
{
    const [data,setData] = useState<any[] | null>(null)
    const [catergories,setCategories] = useState<any[]>([])
    const [marques,setMarques] = useState<any[]>([])
    const [etats,setEtats] = useState<any[]>([])
    const [lieux,setLieux] = useState<any[]>([])
    const [sections,setSections] = useState<any[]>([])
    const [loading,setLoading] = useState<boolean>(true)
    const [loadingMessage,setLoadingMessage] = useState<String>("loading")
    const [type,setType] = useState<string>(Object.values(types).includes(props.type) ? props.type : types.unknown)

    async function fetchItems()
    {
        try
        {
            const query = await fetch("http://"+getIp()+":3001/item/inner/all",{
                credentials: "include"
            });
            const response = await query.json();
            setData(response);
        }
        catch (error)
        {
            console.log(error)
        }
    }

    async function fetchArchivedItems()
    {
        try
        {
            const query = await fetch("http://"+getIp()+":3001/item/archived/inner/all",{
                credentials: "include"
            });
            const response = await query.json();
            setData(response);
        }
        catch (error)
        {
            console.log(error)
        }
    }    

    useEffect(() =>  {
        if(data == null)
        {
            if(type == types.inventory)
            {
                fetchItems();
            }
            else if(type == types.archive)
            {
                fetchArchivedItems();
            }
        }
    },[type])   
    useEffect(() => {
        async function fetchInnerData(){
            try
            {
                const query = await fetch("http://"+getIp()+":3001/item/FK/all",{
                    credentials: "include"
                });
                const response = await query.json();
                
                let categories = response.find((element:any) => element.key == "materiel") ? response.find((element:any) => element.key == "materiel").values : [];
                let marques = response.find((element:any) => element.key == "marque") ? response.find((element:any) => element.key == "marque").values : [];
                let etats = response.find((element:any) => element.key == "etat") ? response.find((element:any) => element.key == "etat").values : [];
                let lieux = response.find((element:any) => element.key == "lieu") ? response.find((element:any) => element.key == "lieu").values : [];
                let sections = response.find((element:any) => element.key == "section") ? response.find((element:any) => element.key == "section").values : [];
                setCategories(categories);
                setMarques(marques);
                setEtats(etats);
                setLieux(lieux);
                setSections(sections);
                setLoading(false);
                
            }
            catch (error)
            {
                console.log(error)
            }
        }
        fetchInnerData();
    },[])

    if(loading || type == types.unknown)
    {
        return (
            <div className="App" style={{width:"100%"}}>
        <div>{loadingMessage}</div>
        </div>)
    }
    else{

        if(type == types.archive){

            return(
                <div className="App" style={{width:"100%"}}>
                    <Archives user={props.user} data={data != null ? data :  [] } etats={etats } lieux={lieux } marques={marques } materiels={catergories } sections={sections } />
                </div>
            )

        }
        else if(type == types.inventory){
            return (<div className="App" style={{width:"100%"}}>
                <Inventory user={props.user} data={data != null ? data :  []} etats={etats } lieux={lieux } marques={marques } materiels={catergories } sections={sections } />
            </div>)
        }
        else{
            return (
                <div className="App" style={{width:"100%"}}>
            <div>{loadingMessage}</div>
            </div>)
        }
    }
}