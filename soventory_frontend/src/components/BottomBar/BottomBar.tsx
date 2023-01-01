import { Button } from "@mui/material";
import { FiPlus } from "react-icons/fi";
import Pagination from "../Pagination/Pagination";
import "./BottomBar.css";
export default function BottomBar(props:{onOpenIEO:()=>void,pageId:number,handlePageChange:(page:number)=>void,readOnly:boolean,setOpenAddPopup:(open:boolean)=>void,setOpenIEO:(open:boolean)=>void,maxPage:number,enablePagination:boolean,setEnablePagination:()=>void}){
    return (<div className="bottom-bar">
            <Button sx={{color:"#550055",borderColor:"#550055",height:"50%",width:"10%",marginTop:"1.5%",marginLeft:"2%"}} variant="outlined" onClick={() => {
               props.onOpenIEO();
            }}>Import/Export</Button>
            <Pagination  page={props.pageId} onPageChange={props.handlePageChange} enabled={props.enablePagination} maxPage={props.maxPage} />
            <Button onClick={() => props.setEnablePagination()} sx={{color:"#550055",borderColor:"#550055",height:"50%",width:"10%",marginTop:"1.5%",marginRight:"2%"}} variant="outlined">{props.enablePagination ? "Désactiver" : "Activer"} la pagination</Button>
                <Button sx={{backgroundColor:"#550055",color:"white",height:"50%",width:"10%",marginTop:"1.5%",marginRight:"2%"}} variant="contained" disabled={props.readOnly} onClick={() => {
                    props.setOpenAddPopup(true);
                }}><FiPlus style={{marginRight:"5px"}}/>Ajouter</Button>
                </div>);
}