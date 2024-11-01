
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
import "./AddOverlayStyle.css";
import Warning from '../WarningBar/WarningBar';
import getIp from '../../IP';

export default function AddOverlay(props:{headers:any[],onApply:(row:any) => void,open:boolean,onClose:() => void,canModify:boolean}){
    
    const [dropDownData,setDropDownData] = useState<any>({});
    const [editRow,setEditRow] = useState<any>({});
    const [fullWidth, setFullWidth] = React.useState(true);
    const [open,setOpen] = useState<boolean>(false);
    const [canModify, setCanModify] = React.useState(props.canModify);
    const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('md');
    const [error,setError] = React.useState<string>("");
    const [openWarning,setOpenWarning] = React.useState(false);
    useEffect(() => {
        console.log(error);
        if(error != ""){
            
            setOpenWarning(true);
        }
    },[error])

    function onClose(){
        setOpen(false);
        props.onClose();
    }
    function formatToDBDate(date:string){
        
        let splitted = date.split('.');
        if(splitted.length >1){
        let day = splitted[0];
        let month = splitted[1];
        let year = splitted[2];
        let returnContent =  `${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`
        console.log(returnContent)
        return returnContent;
        }else{
            return date;
        }
        
    }
    async function onApply(){
        if(verifiyRowIntergrity(editRow)){
            var formattedEditRow = formatedRowWithListId(editRow)

            if(!verifiyRowIntergrity(formattedEditRow) && formattedEditRow == null) return onClose();
            var errors : any = await props.onApply(formattedEditRow);
            if(errors != null && errors.length > 0){
                
                setError(errors[errors.length - 1]);
                setOpenWarning(true)
            }
            else{
                onClose();
            }
            
        }
    }
    function formatedRowWithListId(row:any){
        var formattedEditRow = row;
        try{
            props.headers.forEach((header) => {
                if(header.inner === true){
                    formattedEditRow[header.key] = dropDownData[header.key].find((item:any) => item.nom === editRow[header.key]) != null ? 
                    dropDownData[header.key].find((item:any) => item.nom === editRow[header.key]).id : formattedEditRow[header.key] ;
                }
            })
            return formattedEditRow;
        }
        catch(e:any){
            setError("cannot cast dropdown list to his id ")
            setOpenWarning(true)
            return row
        }
        
    }
    function verifiyRowIntergrity(row:any){
        let newError = "";
        var returnValue = true;
        props.headers.forEach((header:any) => {
            if(header.key == "id")return;
            if(header.required && (row[header.key] == undefined || row[header.key] == "")){
                newError = `le champ '${header.labelName}' est requis`
                returnValue = false;
            }
        });
        if(newError != ""){
            setOpenWarning(true);
            setError(newError);
        }
        
        return returnValue;
    }
            
    function getnewId(){
        //id : year + increment like 22001
        return (new Date(Date.now()).getFullYear().toString().substring(2, 4)).toString() + "xxx";

    }

    function handleDatesChange(row:any,key:string,value:any)
    {
        if(key == "date_achat"){

            // add value to year of date row.date_achat
            if(row.garantie){
                let date = new Date(row.date_achat);
                date.setFullYear(date.getFullYear() + row.garantie);
                row.fin_garantie = FormatDate(date);
            }
        }else if(key == "fin_garantie"){

            if(row.date_achat){
                let date = new Date(row.fin_garantie);
                date.setFullYear(date.getFullYear() - row.garantie);
                row.date_achat = FormatDate(date);
            }

        }
        else if (key == "garantie"){
            if(row.fin_garantie){
                let date = new Date(row.date_achat);
                date.setFullYear(date.getFullYear() + parseInt(value));
                row.fin_garantie = FormatDate(date);
            }

        }
    }

    function FormatDate(date:Date)
    {
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        return `${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
    }

    async function createNewInner(key:string,value:string){
        var newDropDownData = dropDownData;
        const query = await fetch(`${getIp()}/item.${key}/create`,{
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({nom:value})
        })
        const queryAll = await fetch(`${getIp()}/item.${key}/all`,{
            method: 'GET',
            credentials: 'include',
        })
        const response = await queryAll.json();
        newDropDownData[key] = response;
        setDropDownData({...newDropDownData});
        return  response
    }

    async function deleteOneInner(key:string,id:number){
        var newDropDownData = dropDownData;
        const query = await fetch(`${getIp()}/item.${key}/${id}/delete`,{
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        const queryAll = await fetch(`${getIp()}/item.${key}/all`,{
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
            const query = await fetch(`${getIp()}/item.${key}/all`,{
            method: 'GET',
            credentials: 'include',
        })
        const response = await query.json();
        //create a list with only the name of all the items
        newDropDownData[key] = response;
        setDropDownData({...newDropDownData});
        console.log(newDropDownData)
        }
    }

    useEffect(() => {
        const initialRow = {...editRow};
        props.headers.forEach((header:any) => {

            if(header.inner === true){
                fetchDropDown(header.key);
            }
           
            if(header.number || header.key == "archive"){
                initialRow[header.key] = 0;
            }
            else{
                initialRow[header.key] = "";
            }
        })
        setEditRow(initialRow);
        setOpen(props.open);
    },[])


        if(open == true && dropDownData != undefined && Object.keys(dropDownData).every((key:any) => dropDownData[key].length >= 0) )
        {
        return (
            <div>
                <Dialog open={open}  fullWidth={fullWidth}
                                     maxWidth={maxWidth} onClose={onClose} aria-labelledby="form-dialog-title"  >
                    <DialogTitle id="form-dialog-title">Ajout</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Ajouter une  l'entrée
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
                                        if(h.key == "id"){
                                            which = "id";
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
                                            if(nextHeader.key == "id"){
                                                which = "id";
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
                                            {header.which === "id" ?  <TextField type={"text"} disabled={true}  fullWidth inputProps={header.number && header.key != "garantie" ? {readOnly:!modifyingMode,step:0.1} :  {readOnly:!modifyingMode}} value={getnewId()}/> 
                                            : 
                                            header.which == "textbox" ? <TextField type={type}  fullWidth inputProps={header.number && header.key != "garantie" ? {readOnly:!modifyingMode,step:0.1} :  {readOnly:!modifyingMode}} value={editRow[header.key]} onChange={(e) => {
                                                var newEditRow = {...editRow};

                                                if(nextHeader.number == true){
                                                    newEditRow[header.key] = parseFloat(e.target.value);
                                                }
                                                else{
                                                    newEditRow[header.key] = e.target.value;
                                                }

                                                if(header.key == "garantie" || header.key == "date_achat" || header.key == "fin_garantie" && e.target.value != ""){
  
                                                    handleDatesChange(newEditRow,header.key,e.target.value);
                                                }
                                                setEditRow(newEditRow)
                                            }}/> : header.which == "dropdownlist" ? <CreatableSelect  readOnly={!modifyingMode} onCreateNewValue={(value:any) =>  {return createNewInner(header.key,value)}} onDelete={(id:number) => deleteOneInner(header.key,id)} onChange={(value:any) =>  {
                                                var newEditRow = {...editRow};
                                                newEditRow[header.key] = value;
                                                if(header.key == "etat" && value == "detruit"){
                                                    newEditRow["archive"] = 1;
                                                }else if (value !== "detruit"){
                                                    newEditRow["archive"] = 0;
                                                }
                                                setEditRow(newEditRow)}} data={dropDownData[header.key]} defaultValue={editRow[header.key]}/> : header.which == "checkbox" ? 
                                               <Checkbox checked={Boolean(editRow[header.key])} inputProps={{readOnly:!modifyingMode}} onChange={(e) => {
                                                var newEditRow = {...editRow};
                                                newEditRow[header.key] = e.target.checked ? 1 : 0;
                                                setEditRow(newEditRow)
                                               }} /> : 
                                                header.which == "datepicker" ? 
                                                <div className="datepicker">{ modifyingMode ? <input required value={formatToDBDate(editRow[header.key])} readOnly={!modifyingMode} type="date" onChange={(event:any) => {
                                                    if(event.target.value == ""){
                                                        return
                                                    }
                                                    try{
                                                        var newEditRow = {...editRow};
                                                        var formatted = FormatDate(new Date(event.target.value));
                                                        newEditRow[header.key] = formatted;
                                                        if(header.key == "garantie" || header.key == "date_achat" || header.key == "fin_garantie"){
                                                            handleDatesChange(newEditRow,header.key,0);
                                                        }
                                                        setEditRow(newEditRow)
                                                    }
                                                    catch(e:any){
                                                        setError(String(e.message))
                                                        setOpenWarning(true)
                                                    }
                                                }} ></input> : <input required  value={formatToDBDate(editRow[header.key])} readOnly={!modifyingMode} type="date" ></input>}</div>: <div>error</div>}
                                            </div>
                                            </div>
                                            {nextHeader != null ? <div style={{width:"100%",marginLeft:margin,marginRight:margin}}>
                                            <div style={{display:"block"}}>
                                            <label>{nextHeader.labelName}</label>
                                            {nextHeader.which == "id" ? <TextField type={"text"} disabled={true}  fullWidth inputProps={nextHeader.number && nextHeader.key != "garantie" ? {readOnly:!modifyingMode,step:0.1} :  {readOnly:!modifyingMode}} value={getnewId()}/>  : nextHeader.which == "textbox" ? <TextField   type={nextType} fullWidth inputProps={nextHeader.number && nextHeader.key != "garantie" ? {readOnly:!modifyingMode,step:0.1} :  {readOnly:!modifyingMode}}value={editRow[nextHeader.key]} onChange={(e) => {
                                                var newEditRow = {...editRow};
                                                if(nextHeader.number == true){
                                                    newEditRow[nextHeader.key] = parseFloat(e.target.value);
                                                }
                                                else{
                                                    newEditRow[nextHeader.key] = e.target.value;
                                                }
                                                
                                                if(nextHeader.key == "garantie" || nextHeader.key == "date_achat" || nextHeader.key == "fin_garantie" && e.target.value != ""){
                                                    handleDatesChange(newEditRow,nextHeader.key,e.target.value);
                                                }
                                                setEditRow(newEditRow)
                                            }}/> : nextHeader.which == "dropdownlist" ? <CreatableSelect readOnly={!nextModifyingMode} onCreateNewValue={(value:any) => {return createNewInner(nextHeader.key,value)}} onDelete={(id:number) => deleteOneInner(nextHeader.key,id)} onChange={(value:any) =>  {
                                                var newEditRow = {...editRow};
                                                newEditRow[nextHeader.key] = value;
                                                if(nextHeader.key == "etat" && value == "detruit"){
                                                    newEditRow["archive"] = 1;
                                                }else if(value != "detruit"){
                                                    newEditRow["archive"] = 0;
                                                }
                                                setEditRow(newEditRow)
                                                }} data={dropDownData[nextHeader.key]} defaultValue={editRow[nextHeader.key]}/> : nextHeader.which == "checkbox" ? 
                                                <Checkbox checked={Boolean(editRow[nextHeader.key])} inputProps={{readOnly:!modifyingMode}} onChange={(e) => {
                                                    var newEditRow = {...editRow};
                                                    newEditRow[nextHeader.key] = e.target.checked ? 1 : 0;
                                                    setEditRow(newEditRow)
                                                   }} /> : 
                                                nextHeader.which == "datepicker" ? 
                                                <div className="datepicker">{ nextModifyingMode ? <input required  value={formatToDBDate(editRow[nextHeader.key])} readOnly={!nextModifyingMode} type="date" onChange={(event:any) => {
                                                    if(event.target.value == ""){
                                                        return
                                                    }
                                                    try{
                                                        var newEditRow = {...editRow};
                                                        var formatted = FormatDate(new Date(event.target.value));
                                                        newEditRow[nextHeader.key] = formatted;
                                                        if(nextHeader.key == "garantie" || nextHeader.key == "date_achat" || nextHeader.key == "fin_garantie"){
                                                            handleDatesChange(newEditRow,nextHeader.key,0);
                                                        }
                                                        setEditRow(newEditRow)}
                                                    catch(e:any){
                                                        setError(String(e.message))
                                                        setOpenWarning(true)
                                                    }
                                                }} ></input> : <input required value={formatToDBDate(editRow[nextHeader.key])} readOnly={!nextModifyingMode} type="date" ></input>}</div> : <div>error</div>}
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
                        <Button onClick={onClose} color="primary" style={{color:"rgb(85,0,85)"}}>
                            Annuler
                        </Button>
                        <Button onClick={() => {onApply()}} color="primary" style={{color:"rgb(85,0,85)"}}>
                            Appliquer
                        </Button>
                    </DialogActions>
                    <div> { error && openWarning &&  <Warning message={error} open={true} onClose={() => {
                        setOpenWarning(false)
        }}  /> }</div>
                </Dialog>
            </div>
        )
    }
    else 
        {
            return <div></div>
        }
    }