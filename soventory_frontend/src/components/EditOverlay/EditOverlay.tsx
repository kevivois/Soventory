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
import getIp from '../../IP';
export default function EditOverlay(props:{id:number|null,onApply:(row:any,changed:boolean) => void,deleteFunction:() => void,open:boolean,onClose:() => void,headers:any[],canModify:boolean}) 
{
    const destructed = "detruit";
    const [open,setOpen] = useState(props.open);
    const [deleteOpen,setDeleteOpen] = useState(false);
    const [editRow,setEditRow] = useState<any| null>(null);
    const [initialRow,setInitialRow] = useState<any| null>(null);
    const [dropDownData,setDropDownData] = useState<any>({});
    const [fullWidth, setFullWidth] = React.useState(true);
    const [canModify, setCanModify] = React.useState(props.canModify);
    const [openWarning,setOpenWarning] = React.useState(false);
    const [error,setError] = React.useState<string>("");

    function FormatDate(date:Date)
    {
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        return `${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
    }


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
    async function fetchDropDownList(){
        let newDropDownData = {...dropDownData}
        try
        {
            const query = await fetch(getIp()+"/item/FK/all",{
                credentials: "include"
            });
            const response = await query.json();
            let categories = response.find((element:any) => element.key == "materiel") ? response.find((element:any) => element.key == "materiel").values : [];
            let marques = response.find((element:any) => element.key == "marque") ? response.find((element:any) => element.key == "marque").values : [];
            let etats = response.find((element:any) => element.key == "etat") ? response.find((element:any) => element.key == "etat").values : [];
            let lieux = response.find((element:any) => element.key == "lieu") ? response.find((element:any) => element.key == "lieu").values : [];
            let sections = response.find((element:any) => element.key == "section") ? response.find((element:any) => element.key == "section").values : [];
            newDropDownData['materiel'] = categories;
            newDropDownData["marque"] = marques;
            newDropDownData["etat"] = etats;
            newDropDownData["lieu"] = lieux;
            newDropDownData['section'] = sections;
            setDropDownData(newDropDownData)
            
        }
        catch (error)
        {
            console.log(error)
        }
    }
    async function fetchItem()
    {
        const response = await fetch(getIp()+'/item/'+props.id,{
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        data[0]["date_achat"] = formatToDBDate(data[0]["date_achat"]);
        data[0]["fin_garantie"] = formatToDBDate(data[0]["fin_garantie"]);
        setInitialRow(data[0]);
        setEditRow(data[0]);
    }
    useEffect(() => {

        fetchDropDownList();
            
        if(props.id != null)
        {
            fetchItem();
        }
    },[props.id])

    function formatToDBDate(date:string){
        
        let splitted = date.split('.');
        let splitted2 = date.split('/');
        let data = [];
        if(splitted.length >1){
            data = splitted;
        }
        else if(splitted2.length >1){
            data = splitted2;
        }
        else{
            return date;
        }
        
        let day = data[0];
        let month = data[1];
        let year = data[2];
        let returnContent =  `${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`
        return returnContent
        
        
    }
    
    async function onApply(){
        if(canModify){
            var formattedEditRow = editRow;
            props.headers.forEach((header) => {
                if(header.inner === true){
                    let v = dropDownData[header.key].find((item:any) => item.nom === editRow[header.key]) ? dropDownData[header.key].find((item:any) => item.nom === editRow[header.key]).id : undefined;
                    if(v == undefined){
                        setError(`La valeur du champ '${header.labelName}' est incorrecte`);
                        setOpenWarning(true);
                        return
                    }
                    formattedEditRow[header.key] =  v;
                }
            })
            let changed = JSON.stringify(editRow) !== JSON.stringify(initialRow);
            let errors:any = await props.onApply(formattedEditRow,changed);
            if(!errors ||errors.length == 0){
                handleClose()
            }else{
                setError(errors[0]);
                setOpenWarning(true);
            }
        }       


    }

    if(open && editRow != null)
    {
        return (
            <div >
                <Dialog open={open}  fullWidth={fullWidth}
                                     maxWidth={maxWidth} onClose={handleClose} aria-labelledby="form-dialog-title"  >
                    <DialogTitle id="form-dialog-title">Modification</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                        Modifier
                         l'entrée
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
                                            {header.which == "textbox" ? <TextField type={type}  fullWidth inputProps={header.number && header.key != "garantie" ? {readOnly:!modifyingMode,step:0.05} :  {readOnly:!modifyingMode}} value={editRow[header.key]} onChange={(e) => {
                                                var newEditRow = {...editRow};

                                                if(header.number == true){
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
                                                }
                                                setEditRow(newEditRow)}} data={dropDownData[header.key]} defaultValue={editRow[header.key]}/> : header.which == "checkbox" ? 
                                               <Checkbox checked={Boolean(editRow[header.key])} disabled={!modifyingMode} onChange={(e) => {
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
                                                        setOpenWarning(true)
                                                        setError(String(e.message))
                                                    }
                                                }} ></input> : <input required  value={formatToDBDate(editRow[header.key])} readOnly={!modifyingMode} type="date" ></input>}</div>: <div>error</div>}
                                            </div>
                                            </div>
                                            {nextHeader != null ? <div style={{width:"100%",marginLeft:margin,marginRight:margin}}>
                                            <div style={{display:"block"}}>
                                            <label>{nextHeader.labelName}</label>
                                            {nextHeader.which == "textbox" ? <TextField   type={nextType} fullWidth inputProps={nextHeader.number && nextHeader.key != "garantie" ? {readOnly:!modifyingMode,step:0.05} :  {readOnly:!modifyingMode}}value={editRow[nextHeader.key]} onChange={(e) => {
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
                                                }
                                                setEditRow(newEditRow)
                                                }} data={dropDownData[nextHeader.key]} defaultValue={editRow[nextHeader.key]}/> : nextHeader.which == "checkbox" ? 
                                                <Checkbox  checked={Boolean(editRow[nextHeader.key])} disabled={!nextModifyingMode} onChange={(e) => {
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
                                                        setOpenWarning(true)
                                                        setError(String(e.message))
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
                        <Button onClick={handleClose} color="primary" style={{color:"rgb(85,0,85)"}}>
                            Annuler
                        </Button>
                        <Button disabled={!canModify} onClick={() => {onApply()}} color="primary" style={{color:"rgb(85,0,85)"}}>
                            Appliquer
                        </Button>
                    </DialogActions>
                    <div>{openWarning && error && <Warning message={error} open={openWarning} onClose={() => setOpenWarning(false)}/> }</div>
                </Dialog>
                <Dialog open={deleteOpen} onClose={handleDeleteClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Delete</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Êtes-vous sûr de vouloir supprimer 
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteClose} color="primary">
                            Annuler
                        </Button>
                        <Button onClick={() => {handleDeleteClose()}} color="primary">
                            Supprimer
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