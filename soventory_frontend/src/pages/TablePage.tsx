import Inventory from "../components/InventoryTable"
import Archives from "../components/ArchiveTable"
import React from 'react';
import { useState,useEffect } from "react";
const types = {
    archive: "archive",
    inventory: "inventory",
    unknown: "unknown"
}
export default function  TablePage(props:{user:any,type:string})
{
    const [data,setData] = useState<any[]>([])
    const [catergories,setCategories] = useState<any[]>([])
    const [marques,setMarques] = useState<any[]>([])
    const [etats,setEtats] = useState<any[]>([])
    const [lieux,setLieux] = useState<any[]>([])
    const [sections,setSections] = useState<any[]>([])
    const [loading,setLoading] = useState<boolean>(true)
    const [loadingMessage,setLoadingMessage] = useState<String>("")
    const [type,setType] = useState<string>(Object.values(types).includes(props.type) ? props.type : types.unknown)

    async function fetchItems()
    {
        try
        {
            const query = await fetch("http://localhost:3001/item/inner/all",{
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
            const query = await fetch("http://localhost:3001/item/archived/inner/all",{
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
        if(data.length == 0)
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
        async function fetchCategories()
        {
            try
            {
                const query = await fetch("http://localhost:3001/item.materiel/all",{
                    credentials: "include"
                });
                const response = await query.json();
                setCategories(response);
            }
            catch (error)
            {
                console.log(error)
            }
        }
        async function fetchMarques()
        {
            try
            {
                const query = await fetch("http://localhost:3001/item.marque/all",{
                    credentials: "include"
                });
                const response = await query.json();
                setMarques(response);
            }
            catch (error)
            {
                console.log(error)
            }
        }
        async function fetchEtats()
        {
            try
            {
                const query = await fetch("http://localhost:3001/item.etat/all",{
                    credentials: "include"
                });
                const response = await query.json();
                setEtats(response);
            }
            catch (error)
            {
                console.log(error)
            }
        }
        async function fetchLieux()
        {
            try
            {
                const query = await fetch("http://localhost:3001/item.lieu/all",{
                    credentials: "include"
                });
                const response = await query.json();
                setLieux(response);
            }
            catch (error)
            {
                console.log(error)
            }
        }
        async function fetchSections()
        {
            var status = -1;
            try
            {
                const query = await fetch("http://localhost:3001/item.section/all",{
                    credentials: "include"
                });
                status = query.status;
                const response = await query.json();
                setSections(response);
            }
            catch (error)
            {
                console.log(error)
            }
            finally
            {
                if(String(status).startsWith("4"))
                {
                    return setLoadingMessage("You are not allowed to access this page");
                }
                setLoading(false);
            }
        }
        fetchCategories();
        fetchMarques();
        fetchEtats();
        fetchLieux();
        fetchSections();
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
                    <Archives user={props.user} data={data} etats={etats} lieux={lieux} marques={marques} materiels={catergories} sections={sections} />
                </div>
            )

        }
        else if(type == types.inventory){
            return (<div className="App" style={{width:"100%"}}>
                <Inventory user={props.user} data={data} etats={etats} lieux={lieux} marques={marques} materiels={catergories} sections={sections} />
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