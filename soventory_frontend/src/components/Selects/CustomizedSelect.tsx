import React, { useEffect, useState } from 'react';
import "./style.css"
export function CustomizedSelect(props:{data:any[],onChange:Function,defaultValue:any,onDelete:Function,onCreateNewValue:Function}){

    const [expanded,setExpanded]=useState(false);
    const [data,setData] = useState(props.data);
    const [selectedValue,setSelectedValue]=useState(props.defaultValue);
    const [textBoxValue,setTextBoxValue]=useState(props.defaultValue);
    const [creatingNew,setCreatingNew]=useState(false);
    const [creatingValue,setCreatingValue]=useState("");

    useEffect(()=>{
        console.log(selectedValue)
    },[selectedValue])
    function showCheckboxes() {
        setExpanded(!expanded)
      }
    function onDelete(e:any){
        props.onDelete(e.target.id);
      }
    function handleChange(value:any,close:boolean){
        setSelectedValue(value);
        setTextBoxValue(value);
        setExpanded(!close)
        props.onChange(value);
    }
    function handleTextBoxChange(e:any){
        
        if(e.target.value != textBoxValue){
            setExpanded(true)
        }
        var find = props.data.find((a:any) => a.nom === e.target.value);
        if(!find){
            setTextBoxValue(e.target.value);
            setCreatingNew(true);
            setCreatingValue(e.target.value);
        }
        else{
            setCreatingValue('');
            setCreatingNew(false);
            handleChange(e.target.value,false);
        }
    }
    function createNewValue(e:any){
       // props.onChange(value);
        setSelectedValue(creatingValue);
        props.onCreateNewValue(creatingValue);
        setExpanded(false);
        setCreatingNew(false);
        setCreatingValue('');
    }


        return (<form>
            <div className="multiselect">
            <div  className="selectBox"  onClick={() => showCheckboxes()}>
                <input type="text" name='text' value={textBoxValue} onChange={(e) => handleTextBoxChange(e) } placeholder="Sélectionner" />
                
            </div>
            {expanded ? 
            <div id="checkboxes">
                {creatingNew && creatingValue.length > 0 ? <div className="selectRow" onClick={(e) => createNewValue(e)} >Créer {creatingValue}</div> : null}
                {data != undefined && data.length > 0 ? data.map((item:any) => {
                    return (
                        <label key={item.id}>
                            <div className='selectRow'>
                            <div className='selectRowContent' onClick={(e) => {
                                handleChange(item.nom,true)
                            }}>{item.nom}</div>
                            <div className='deleteIcon' onClick={() => props.onDelete(item.id)}>X</div>
                            </div>
                        </label>
                    )
                }): null}
            </div> : null }
            </div>
        </form>)

}