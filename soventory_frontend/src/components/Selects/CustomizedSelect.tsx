import React, { useEffect, useState,useRef  } from 'react';
import "./style.css"
export function CustomizedSelect(props:{data:any[],onChange:Function,defaultValue:any,onDelete:(value: any) => Promise<any>,onCreateNewValue:(value: any) => Promise<any>}){

    const [expanded,setExpanded]=useState(false);
    const [data,setData] = useState(props.data);
    const [selectedValue,setSelectedValue]=useState(props.defaultValue);
    const [textBoxValue,setTextBoxValue]=useState(props.defaultValue);
    const [creatingNew,setCreatingNew]=useState(false);
    const [creatingValue,setCreatingValue]=useState("");
    const ref = useRef<HTMLFormElement>();
    function showCheckboxes() {
        setExpanded(!expanded)
      }
    async function handleDelete(id:any){
        var newData = await  props.onDelete(id);
        setData(newData)
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
   async function createNewValue(e:any){
       // props.onChange(value);
        setSelectedValue(creatingValue);
       var newData = await  props.onCreateNewValue(creatingValue);
        setExpanded(false);
        setCreatingNew(false);
        setCreatingValue('');
        setData(newData)
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
                            <div className='deleteIcon' onClick={() => handleDelete(item.id)}>X</div>
                            </div>
                        </label>
                    )
                }): null}
            </div> : null }
            </div>
        </form>)

}