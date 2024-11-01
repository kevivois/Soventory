import React, { useEffect, useState,useRef  } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import "./style.css"
export function CustomizedSelect(props:{data:any[],readOnly:boolean,onChange:Function,defaultValue:any,onDelete:(value: any) => Promise<any>,onCreateNewValue:(value: any) => Promise<any>}){

    const [expanded,setExpanded]=useState(false);
    const [data,setData] = useState(props.data);
    const [selectedValue,setSelectedValue]=useState(props.defaultValue);
    const [textBoxValue,setTextBoxValue]=useState(props.defaultValue);
    const [creatingNew,setCreatingNew]=useState(false);
    const [creatingValue,setCreatingValue]=useState("");
    const ref = useRef(null)

    useEffect(()=> {
        // add listener for click outside of element
        document.addEventListener("mousedown", handleClickOut);
        return () => {
            // cleanup
            document.removeEventListener("mousedown", handleClickOut);
        }
    },[])

    useEffect(()=>{
        setData(props.data)
        },[props.data]);

    function handleClickOut(event:any){

        const curr = ref.current as any;        // non c'est trop mdrrrrrr
        if(curr && !curr.contains(event.target)){
            setExpanded(false);
        }else{
            return;
        }
        
    }
    
    function showCheckboxes() {
        if(props.readOnly){
            return;
        }
        setExpanded(!expanded)
      }
    async function handleDelete(id:any){
        var newData = await  props.onDelete(id);
        setData(newData)
      }
    function handleChange(event:any,value:any,close:boolean){
        setCreatingNew(false);
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
            handleChange(e,e.target.value,false);
        }
    }
   async function createNewValue(e:any){
        setSelectedValue(creatingValue);
        var newData = await  props.onCreateNewValue(creatingValue);
        setExpanded(false);
        setCreatingNew(false);
        setCreatingValue('');
        setData(newData)
        props.onChange(creatingValue);
    }


        return (<form ref={ref as any}>
            <div className="multiselect">
            <div  className="selectBox"  onClick={() => showCheckboxes()}>
                <input type="text" readOnly={props.readOnly} name='text' value={textBoxValue} onChange={(e) => handleTextBoxChange(e) } placeholder="Sélectionner" />
                
            </div>
            {expanded ? 
            <div id="checkboxes-container">
            <div id="checkboxes">
                {creatingNew && creatingValue.length > 0 ? <div className='selectRow'><div className="selectRowContent" onClick={(e) => createNewValue(e)} >Créer {creatingValue}</div></div> : null}
                {data != undefined && data.length > 0 ? data.map((item:any) => {
                    return (
                        <label key={item.id}>
                            <div className='selectRow'>
                            <div className='selectRowContent' onClick={(e) => {
                                handleChange(e,item.nom,true)
                            }}>{item.nom}</div>
                            <div className='deleteIcon' onClick={(e) => {
                                handleDelete(item.id)}}><DeleteIcon /></div>
                            </div>
                        </label>
                    )
                }): null}
            </div></div> : null }
            </div>
        </form>)

}