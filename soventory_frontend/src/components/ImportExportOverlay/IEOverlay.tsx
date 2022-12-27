import React, { useEffect, useState } from 'react';
import  getIp  from '../../IP';
import Button from '@mui/material/Button';
import Dialog,{DialogProps} from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Headers from "../headers"
import {csvToObjectArray} from ".././utils/file.utils"; 
import CsvPreview	 from './CsvPreview';
import * as XLSX from 'xlsx';
import "./IEOverlay.css";
import Warning from '../WarningBar/WarningBar';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
const sizeLimitMB = 3;
export default function ImportExportDialog(props:{buttonLabel:any,dialogTitle:any,open:boolean,onImport:(array:any) => void,onClose:() => void}) {
  const [open, setOpen] = useState(props.open);
  const [activeTab, setActiveTab] = useState(0); // 0 for import tab, 1 for export tab
  const [file, setFile] : any = useState<any>({}); // the selected file
  const [fileSize, setFileSize] = useState(0); // the size of the selected file in bytes
  const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('md');
  const [fullWidth, setFullWidth] = React.useState(true);
  const [fileSizeInMB,setFileSizeInMB] = useState(0)
  const [fileArray,setFileArray] = useState<any[]>([])
  const [csvFile,setCsvFile] = useState<string>("")
  const [error,setError] = useState<string>("")
  const [warningBar,setWarningBar] = useState<boolean>(false)

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    props.onClose();
  };

  const handleTabChange = (event:any, newValue:any) => {
    setActiveTab(newValue);
  };

  const handleFileChange = async (event:any) => {
    let selectedFile = event.target.files[0];
    //check if file is csv or xlsx
    let size = selectedFile.size/1000000
    if(!selectedFile.name.match(/.csv|.xlsx/||/.xls/)){
      return setError("Le fichier n'est pas au bon format, format accepté : .csv, .xlsx, .xls")
    }
    if(size <= sizeLimitMB){
    setFileSizeInMB(size);
    setFile(selectedFile);
    setFileSize(selectedFile.size)
  }else{
    setError("Le fichier est trop volumineux")
  }
  };
  useEffect(() => {
    async function refresh(){
      if(file.name){
        await transformFile();
      }
    }
    refresh();
  }, [file])
  useEffect(() => {
    if(error){
      setWarningBar(true)
      }
      }, [error])
  const transformFile = async () =>{

        var reader = new FileReader();
        // convert to show in table  format
        if(file.type.match(/application\/vnd.ms-excel|application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet/)){
          await reader.readAsBinaryString(file);
        }else{
          await reader.readAsText(file, "UTF-8");
        }
        reader.onload = (e) => {
          let csv = reader.result as any;
          if(file.type.match(/application\/vnd.ms-excel|application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet/)){
            const workbook = XLSX.read(csv, { type: 'binary' });
            csv = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
          }
          setCsvFile(csv);
          let result = csvToObjectArray(csv);
          checkFile(result.data);
          setFileArray(result.data as []);
        }
        
  }

  function checkFile(array:any){
    let canImport = true;
    if(array.length > 0){
      let currentHeaders = Object.keys(array[0]);
      Headers.forEach((header)=>{
        if(header.key =="id"){return}
        if(!currentHeaders.includes(header.key)){
          canImport = false;
          setError("Le fichier ne contient pas les bonnes colonnes")
        }
      });
      
    }else{
      setError("Le fichier est vide")
    }
    return canImport
  }
  const handleImport = () => {
    // Add code to import data here
    // You can access the file and file size with the file and fileSize state variables
    // You can check the file format and size and add the data to your application here

    let canImport = checkFile(fileArray);
    if(canImport){
      handleClose();
      props.onImport(fileArray);
  };
};
const downloadExample = (event:any) => {
  event.preventDefault();
  const headers = Headers.filter((header) => header.key !== "id").map((header) => header.key);
  const data = [headers];
  console.log(data)
  const csvContent = `data:text/csv;charset=utf-8,${data.map((e) => e.join(";")).join("")}`;
  // show the good format for é,è,à,ù,ç
  console.log(csvContent)
  const encodedUri = encodeURI(csvContent);
  console.log(encodedUri)
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "Soventory_Example_format.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
}
  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth={maxWidth} fullWidth={fullWidth}>
        <DialogTitle id="form-dialog-title">{props.dialogTitle}</DialogTitle>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Import" />
        </Tabs>
        <DialogContent className="root">
          <div className="container">
      <h1>Import de fichier (csv,xlsx)</h1>
      <div id="form">
        <label>Sélectionne ton fichier</label>
        <div id="div_input_file"><input onChange={handleFileChange}  type="file" id="file" name="file" accept=".xlsx, .xls, .csv" /><Button onClick={downloadExample}><QuestionMarkIcon /></Button></div>
      </div>
      <div id="excel-preview" style={fileArray.length > 0 ? {display:'block'}:{display:"none"}}>
        <CsvPreview data={fileArray} />
      </div>
      {error && warningBar && <div className='error'><Warning open={warningBar} message={error} onClose={() => {setWarningBar(false)}} /></div> }
    </div>
  </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleImport} color="primary">
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
  }