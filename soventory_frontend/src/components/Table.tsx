import React,{useState,useEffect} from "react"

export default function DataTable()
{
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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


    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;

    return (
        <table>
            <thead>
                <tr>
                    <th>Id</th>
                    <th>materiel</th>
                    <th>marque</th>
                    <th>modele</th>
                    <th>Numero de série</th>
                    <th>Numero de produit</th>
                    <th>section</th>
                    <th>état</th>
                    <th>lieu</th>
                    <th>remarques</th>
                    <th>Date d'achat</th>
                    <th>garantie</th>
                    <th>Date de fin de garantie</th>
                    <th>prix</th>
                </tr>
            </thead>
            <tbody>
                { data.length && data.length > 0 ? 
                data.map((item:any) => (
                    <tr key={item.id} style={{textAlign:"center"}}>
                        <td>{item.id}</td>
                        <td>{item.materiel}</td>
                        <td>{item.marque}</td>
                        <td>{item.modele}</td>
                        <td>{item.num_serie}</td>
                        <td>{item.num_produit}</td>
                        <td>{item.section}</td>
                        <td>{item.etat}</td>
                        <td>{item.lieu}</td>
                        <td>{item.remarque}</td>
                        <td>{new Date(item.date_achat as Date).toLocaleDateString("fr")}</td>
                        <td>{item.garantie}</td>
                        <td>{new Date(item.fin_garantie as Date).toLocaleDateString("fr")}</td>
                        <td>{item.prix}</td>
                    </tr>
                )) : <tr><td colSpan={3}>No data</td></tr> }
            </tbody>
        </table>
    );
}