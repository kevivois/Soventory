import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Modal from '@mui/material/Modal';
import TextField from "@mui/material/TextField"
import  Checkbox  from '@mui/material/Checkbox';
import Headers from "../headers";
import { Box } from '@mui/system';
//import CreatableSelect from './Selects/CreatableSelect';
import { CustomizedSelect as CreatableSelect } from '../Selects/CustomizedSelect';
import React,{useEffect, useState} from 'react';
import "./EditOverlayStyle.css";
import Warning from '../WarningBar/WarningBar';
export default function EditOverlay(props:{id:number|null,onApply:(row:any) => void,deleteFunction:() => void,open:boolean,onClose:() => void,headers:any[],canModify:boolean}) 
{
    const [open,setOpen] = useState(props.open);
    const [deleteOpen,setDeleteOpen] = useState(false);
    const [editRow,setEditRow] = useState<any| null>(null);
    const [dropDownData,setDropDownData] = useState<any>({});
    const [fullWidth, setFullWidth] = React.useState(true);
    const [canModify, setCanModify] = React.useState(props.canModify);
    const [openWarning,setOpenWarning] = React.useState(false);
    const [error,setError] = React.useState<string>("");
  const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('md');
    const handleClose = () => {
        props.onClose();
    }
    const handleDeleteClose = () => {
        setDeleteOpen(false);
    }
    const handleDeleteOpen = () => {
        setDeleteOpen(true);
    }

    useEffect(() => {
        if(error !=""){
            setOpenWarning(true);
        }
    },[error])
    function handleDatesChange(year:number)
    {
        try{

        const maxDate = new Date(editRow["date_achat"]).setFullYear(new Date(editRow["date_achat"]).getFullYear() + year);
        const formatted = new Date(maxDate).toISOString().slice(0,10);
        return formatted
        }
        catch(e:any){
            setError(String(e.message))
            const normal = new Date(editRow["date_achat"]).toISOString().slice(0,10);
            return normal
        }
    }
    async function createNewInner(key:string,value:string){
        var newDropDownData = dropDownData;
        const query = await fetch(`http://localhost:3001/item.${key}/create`,{
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({nom:value})
        })
        const queryAll = await fetch(`http://localhost:3001/item.${key}/all`,{
            method: 'GET',
            credentials: 'include',
        })
        const response = await queryAll.json();
        newDropDownData[key] = response;
        setDropDownData({...newDropDownData});
        return  response
    }
    async function deleteOneInner(key:string,id:number){
        console.log("a")
        var newDropDownData = dropDownData;
        const query = await fetch(`http://localhost:3001/item.${key}/${id}/delete`,{
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        const queryAll = await fetch(`http://localhost:3001/item.${key}/all`,{
            method: 'GET',
            credentials: 'include',
        })
        const response = await queryAll.json();
        newDropDownData[key] = response;
        setDropDownData({...newDropDownData});
        return  response
    }
    async function fetchDropDown(key:string){
        var newDropDownData = dropDownData;
        if(newDropDownData[key] == undefined){
            const query = await fetch(`http://localhost:3001/item.${key}/all`,{
            method: 'GET',
            credentials: 'include',
        })
        const response = await query.json();
        //create a list with only the name of all the items
        newDropDownData[key] = response;
        setDropDownData(newDropDownData);
        }
    }
    async function fetchItem()
    {
        const response = await fetch('http://localhost:3001/item/'+props.id,{
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        setEditRow(data[0]);
    }
    useEffect(() => {
        props.headers.forEach((header) => {
            if(header.inner === true){
                fetchDropDown(header.key);
            }
        })
            
        if(props.id != null)
        {
            fetchItem();
        }
    },[props.id])

    
    function onApply(){
        if(canModify){
            var formattedEditRow = editRow;
            props.headers.forEach((header) => {
                if(header.inner === true){
                    formattedEditRow[header.key] = dropDownData[header.key].find((item:any) => item.nom === editRow[header.key]).id;
                }
            })

            props.onApply(formattedEditRow);
        }   handleClose()
    }

    if(open && editRow != null)
    {
        return (
            <div >
                <Dialog open={open}  fullWidth={fullWidth}
                                     maxWidth={maxWidth} onClose={handleClose} aria-labelledby="form-dialog-title"  >
                    <DialogTitle id="form-dialog-title">Edit</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Edit the row
                        </DialogContentText>
                        <Box sx={{display:'flex',flexDirection:'row',width:"100%",heigth:"100%"}}>
                            <Box sx={{display:'flex',flexDirection:'column',justifyContent:'space-between',width:"100%"}}>
                                {props.headers.map((h:any,key:number) => {
                                    var index = props.headers.indexOf(h);
                                    if(index % 2 == 0)
                                    {
                                        var modifyingMode = canModify;
                                        var nextModifyingMode = canModify;
                                        var which = "textbox";
                                        if(h.isDropDownList == true)
                                        {
                                            which = "dropdownlist";
                                        }
                                        else if(h.key == "archive")
                                        {
                                            which = "checkbox"
                                        }
                                        else if(h.key == "fin_garantie" || h.key == "date_achat")
                                        {
                                            which = "datepicker"
                                        }
                                        var header = {...h,which:which}
                                        var nextHeader = props.headers.at(index+1);
                                        var type="text";
                                        var nextType="text"
                                        if(header.number == true){
                                            type = "number"
                                        } 
                                        which = "textbox"
                                        if(nextHeader != undefined)
                                        {
                                            if(nextHeader.number == true){
                                                nextType = "number"
                                            }

                                            if(nextHeader.isDropDownList == true)
                                            {
                                                which = "dropdownlist";
                                            }
                                            else if(nextHeader.key == "archive")
                                            {
                                                which = "checkbox"
                                            }
                                            else if(nextHeader.key == "fin_garantie" || nextHeader.key == "date_achat")
                                            {
                                                which = "datepicker"
                                            }
                                            nextHeader = {...nextHeader,which:which}

                                            if(header.key == "id"){
                                                modifyingMode = false;
                                                
                                            }
                                            else if(nextHeader.key == "id"){
                                                nextModifyingMode = false;
                                            }
                                        }
                                        var width= nextHeader != null ? "100%":"49.5%"
                                        var margin = nextHeader != null ? "1%" : "2%"

                                        return (
                                            <div key={header.id} style={{width:width}}>
                                            <Box  sx={{display:'flex',flexDirection:'row',width:'100%'}}>
                                            <div style={{width:"100%"}}>
                                            <div style={{display:"block"}}>
                                            <label>{header.labelName}</label>
                                            {header.which == "textbox" ? <TextField type={type}  fullWidth inputProps={header.number && header.key != "garantie" ? {readOnly:!modifyingMode,step:0.1} :  {readOnly:!modifyingMode}} value={editRow[header.key]} onChange={(e) => {
                                                var newEditRow = {...editRow};

                                                if(nextHeader.number == true){
                                                    newEditRow[header.key] = parseFloat(e.target.value);
                                                }
                                                else{
                                                    newEditRow[header.key] = e.target.value;
                                                }
                                                if(header.key == "garantie" && e.target.value != ""){
  
                                                    var maxDate = handleDatesChange(parseInt(e.target.value));
                                                    newEditRow["fin_garantie"] = maxDate;
                                                }
                                                setEditRow(newEditRow)
                                            }}/> : header.which == "dropdownlist" ? <CreatableSelect  readOnly={!modifyingMode} onCreateNewValue={(value:any) =>  {return createNewInner(header.key,value)}} onDelete={(id:number) => deleteOneInner(header.key,id)} onChange={(value:any) =>  {
                                                var newEditRow = {...editRow};
                                                newEditRow[header.key] = value;
                                                setEditRow(newEditRow)}} data={dropDownData[header.key]} defaultValue={editRow[header.key]}/> : header.which == "checkbox" ? 
                                                <Checkbox value={Boolean(editRow[header.key])} onChange={(e) => {
                                                    var newEditRow = {...editRow};
                                                    newEditRow[header.key] = Number(e.target.checked);
                                                    setEditRow(newEditRow)
                                                }}/> : 
                                                header.which == "datepicker" ? 
                                                <div className="datepicker">{ modifyingMode ? <input required value={editRow[header.key]} readOnly={!modifyingMode} type="date" onChange={(event:any) => {
                                                    if(event.target.value == ""){
                                                        return
                                                    }
                                                    try{
                                                        var newEditRow = {...editRow};
                                                        var formatted = new Date(event.target.value).toISOString().slice(0,10);
                                                        newEditRow[header.key] = formatted;
                                                        setEditRow(newEditRow)
                                                    }
                                                    catch(e:any){
                                                        setError(String(e.message))
                                                    }
                                                }} ></input> : <input required  value={editRow[header.key]} readOnly={!modifyingMode} type="date" ></input>}</div>: <div>error</div>}
                                            </div>
                                            </div>
                                            {nextHeader != null ? <div style={{width:"100%",marginLeft:margin,marginRight:margin}}>
                                            <div style={{display:"block"}}>
                                            <label>{nextHeader.labelName}</label>
                                            {nextHeader.which == "textbox" ? <TextField   type={nextType} fullWidth inputProps={nextHeader.number && nextHeader.key != "garantie" ? {readOnly:!modifyingMode,step:0.1} :  {readOnly:!modifyingMode}}value={editRow[nextHeader.key]} onChange={(e) => {
                                                var newEditRow = {...editRow};
                                                if(nextHeader.number == true){
                                                    newEditRow[nextHeader.key] = parseFloat(e.target.value);
                                                }
                                                else{
                                                    newEditRow[nextHeader.key] = e.target.value;
                                                }
                                                
                                                if(nextHeader.key == "garantie" && e.target.value != ""){
                                                    var maxDate = handleDatesChange(parseInt(e.target.value));
                                                    newEditRow["fin_garantie"] = maxDate;
                                                }
                                                setEditRow(newEditRow)
                                            }}/> : nextHeader.which == "dropdownlist" ? <CreatableSelect readOnly={!nextModifyingMode} onCreateNewValue={(value:any) => {return createNewInner(nextHeader.key,value)}} onDelete={(id:number) => deleteOneInner(nextHeader.key,id)} onChange={(value:any) =>  {
                                                var newEditRow = {...editRow};
                                                newEditRow[nextHeader.key] = value;
                                                setEditRow(newEditRow)}} data={dropDownData[nextHeader.key]} defaultValue={editRow[nextHeader.key]}/> : nextHeader.which == "checkbox" ? 
                                                <div>checkbox</div> : 
                                                nextHeader.which == "datepicker" ? 
                                                <div className="datepicker">{ nextModifyingMode ? <input required  value={editRow[nextHeader.key]} readOnly={!nextModifyingMode} type="date" onChange={(event:any) => {
                                                    if(event.target.value == ""){
                                                        return
                                                    }
                                                    try{
                                                        var newEditRow = {...editRow};
                                                        var formatted = new Date(event.target.value).toISOString().slice(0,10);
                                                        newEditRow[nextHeader.key] = formatted;
                                                        setEditRow(newEditRow)}
                                                    catch(e:any){
                                                        setError(String(e.message))
                                                    }
                                                }} ></input> : <input required value={editRow[nextHeader.key]} readOnly={!nextModifyingMode} type="date" ></input>}</div> : <div>error</div>}
                                            </div>
                                            </div> : null}
                                            </Box>
                                            </div>
                                        )
                                            }
                                })}
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={() => {onApply()}} color="primary">
                            Apply
                        </Button>
                    </DialogActions>
                    <div>{openWarning ? <Warning message={error} open={openWarning} /> : null }</div>
                </Dialog>
                <Dialog open={deleteOpen} onClose={handleDeleteClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Delete</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this row?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={() => {handleDeleteClose()}} color="primary">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
    else 
    {
        return <div></div>
    }

}