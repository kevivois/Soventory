import React, { useEffect, useState } from 'react';
import "./style.css"
export function CustomizedSelect(props:{data:any[],onChange:Function,defaultValue:any,onDelete:Function}){

    const [expanded,setExpanded]=useState(false);
    const [selectedValue,setSelectedValue]=useState(props.defaultValue);

    useEffect(()=>{
        console.log(selectedValue)
    },[selectedValue])
    function showCheckboxes() {
        setExpanded(!expanded)
      }
    function onDelete(e:any){
        props.onDelete(e.target.id);
      }
    function handleChange(value:any){
        setSelectedValue(value);
        setExpanded(false)
        props.onChange(value);
    }


        return (<form style={{minHeight:"115px"}}>
            <div className="multiselect">
            <div  className="selectBox" onClick={() => showCheckboxes()}>
                <input type="text" readOnly={false} value={selectedValue} placeholder="Sélectionner" onChange={(e) => {
                }} />
                <div className="overSelect"></div>
            </div>
            {expanded ? 
            <div id="checkboxes">
                {props.data.map((item:any) => {
                    return (
                        <label key={item.id}>
                            <div className='selectRow'>
                            <div className='selectRowContent' onClick={(e) => {
                                handleChange(item.nom)
                            }}>{item.nom}</div>
                            <div className='deleteIcon'>X</div>
                            </div>
                        </label>
                    )
                })}
            </div> : null }
            </div>
        </form>)

}