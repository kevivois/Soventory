import Table from "../components/Table"
import { useState,useEffect } from "react";
export default function  TablePage()
{
    const [data,setData] = useState<any[]>([])
    const [catergories,setCategories] = useState<any[]>([])
    const [marques,setMarques] = useState<any[]>([])
    const [etats,setEtats] = useState<any[]>([])
    const [lieux,setLieux] = useState<any[]>([])
    const [sections,setSections] = useState<any[]>([])
    const [loading,setLoading] = useState<boolean>(true)

    useEffect(() => {
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
            try
            {
                const query = await fetch("http://localhost:3001/item.section/all",{
                    credentials: "include"
                });
                const response = await query.json();
                setSections(response);
            }
            catch (error)
            {
                console.log(error)
            }
            finally
            {
                setLoading(false);
            }
        }
        fetchItems();
        fetchCategories();
        fetchMarques();
        fetchEtats();
        fetchLieux();
        fetchSections();
    },[])

    return (
        <div className="App">
            {loading ? <div>Loading...</div> : <Table data={data} etats={etats} lieux={lieux} marques={marques} materiels={catergories} sections={sections} />}
        </div>
    );
}