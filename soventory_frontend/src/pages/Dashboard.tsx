import Table from "../components/Table"
import { useState,useEffect } from "react";
export default function  Dashboard()
{
    const [data,setData] = useState<any[]>([])
    const [loading,setLoading] = useState<boolean>(true)

    useEffect(() => {
        async function fetchData()
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
            finally
            {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="App">
            {loading ? <div>Loading...</div> : <Table data={data} />}
        </div>
    );
}