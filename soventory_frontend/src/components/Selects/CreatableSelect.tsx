import Creatable, { useCreatable } from 'react-select/creatable';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from 'react';

export default function  CreatableSelect(props:{data:any[],onChange:Function,defaultValue:any,onDelete:Function}){
    const [value,setValue]=useState(props.defaultValue);
    useEffect(()=>{
        console.log(props.data)
        },[props.data])
    const handleChange=(newValue:any,actionMeta:any)=>{
        setValue(newValue);
        props.onChange(newValue);
    }
    return (
        <Creatable  menuIsOpen={true} onCreateOption={(inputValue:string) => {
            console.log(inputValue)
        }} isSearchable={true} allowCreateWhileLoading={true} isClearable={true} options={props.data} onChange={handleChange} value={value} 
                formatCreateLabel={(i:any) => `Créer ${i}`} placeholder={"Sélectionner"}  formatOptionLabel={(data:any) => <div>{data.nom}<DeleteIcon style={{float:"right"}} onClick={(e)=> {
                    e.preventDefault();
                    console.log("deleting",data.nom)}}/></div>}/>
    );
}