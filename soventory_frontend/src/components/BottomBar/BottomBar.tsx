import { Button } from "@mui/material";
import { FiPlus } from "react-icons/fi";
import Pagination from "../Pagination/Pagination";
import "./BottomBar.css";
export default function BottomBar(props:{onOpenIEO:()=>void,pageId:number,handlePageChange:(page:number)=>void,readOnly:boolean,setOpenAddPopup:(open:boolean)=>void,setOpenIEO:(open:boolean)=>void,maxPage:number,enablePagination:boolean,setEnablePagination:()=>void}){
    return (<div className="bottom-bar">
            <Button sx={{color:"#550055",borderColor:"#550055",marginLeft:"2%",width:"12%",":hover":{borderColor:"#f13dbe",color:"#f13dbe"}}} variant="outlined" onClick={() => {
               props.onOpenIEO();
            }}>Import/Export</Button>
            <Pagination  page={props.pageId} onPageChange={props.handlePageChange} enabled={props.enablePagination} maxPage={props.maxPage} />
                <Button id="bottombarAddButton" sx={{backgroundColor:"#550055",color:"white",marginRight:"2%",width:"12%",":hover":{backgroundColor:"#f13dbe",color:"white"}}} variant="contained" disabled={props.readOnly} onClick={() => {
                    props.setOpenAddPopup(true);
                }}><FiPlus style={{marginRight:"5px"}}/>Ajouter</Button>
                </div>);
}