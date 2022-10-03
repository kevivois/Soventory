import { useState } from "react";
import "./style/FilterOverlay.css";
export default function FilterOverlay(props:{options:any[],onEachOptionClick:(option:any,event:any)=>void,isOpen:boolean,onClose:()=>void,ref:any})
{
    const [isOpen,setOpen] = useState(props.isOpen);
    const [options,setOptions] = useState(props.options);
    

    if(isOpen)
    {
        console.log(isOpen)
        return (
            <div className="filter-overlay" >
                <div className="filter-overlay-content">
                    <div className="filter-overlay-header">
                        <h3>Filter</h3>
                        <button onClick={()=>{
                            setOpen(false);
                            props.onClose();
                        }}>Close</button>
                    </div>
                    <div className="filter-overlay-body">
                        {options.map((option)=>{
                            return (
                                <div className="filter-overlay-option" onClick={(event)=>{
                                    props.onEachOptionClick(option,event);
                                }}>
                                    <h4>{option.nom}</h4>
                                    <p>{option.checked}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }
    else
    {
        return <div></div>
    }

}