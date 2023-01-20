import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog,{DialogProps} from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Headers from "../headers"
import {csvToObjectArray} from ".././utils/file.utils"; 
import CsvPreview	 from './CsvPreview';
import * as XLSX from 'xlsx';
import "./IEOverlay.css";
import Warning from '../WarningBar/WarningBar';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import {ExportToExcel,exportToCsv,exportToPDF} from "../utils/file.utils"
const sizeLimitMB = 3;
export default function ImportExportDialog(props:{open:boolean,onImport:(array:any) => void,onClose:() => void,exportArray:any[],enable:boolean}) {
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
  const [enableImport,setEnableImport] = useState<boolean>(false)
  const [enableExport,setEnableExport] = useState<boolean>(false)
  const [exportArray,setExportArray] = useState<any[]>(props.exportArray);
  const [warningBar,setWarningBar] = useState<boolean>(false);
  const exportOptions = ["csv","xlsx","xls","pdf"];
  const [exportExt,setExportExt] = useState<string>(exportOptions[0]);

  useEffect(() => {
    if(activeTab == 1){
      setEnableExport(checkFile(exportArray));
    }
  },[exportArray,activeTab]);
  function Error(text:string){
    setError(text);
    setWarningBar(true);

  }

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
      return Error("Le fichier n'est pas au bon format, format accepté : .csv, .xlsx, .xls")
    }
    if(size <= sizeLimitMB){
    setFileSizeInMB(size);
    setFile(selectedFile);
    setFileSize(selectedFile.size)
  }else{
    Error("Le fichier est trop volumineux")
  }
  };
  useEffect(() => {
    async function refresh(){
      if(file.name){
        await transformFile();
      }
    }
    refresh();
  }, [file]);
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
            const workbook = XLSX.read(csv, { type: 'binary',dateNF:'dd"."mm"."yyyy' });
            csv = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
          }
          setCsvFile(csv);
          console.log(csv)
          let result = csvToObjectArray(csv);
          let r = checkFile(result.data);
          setEnableImport(r);
          setFileArray(result.data as []);
        }
        
  }

  function checkFile(array:any){
    let ok = true;
    if(array.length > 0){
      let currentHeaders = Object.keys(array[0]);
      Headers.forEach((header)=>{
        if(!currentHeaders.includes(header.key)){
          ok = false;
          Error("Le fichier ne contient pas les bonnes colonnes")
        }
      });
      
    }else{
      ok = false;
      Error("Le fichier est vide")
    }
    return ok
  }

const Importing = () => {
    let canImport = checkFile(fileArray);
    if(canImport){
      handleClose();
      props.onImport(fileArray);
  };
}
const Exporting = () => {
  
  if(exportArray.length == 0){return Error("Aucune donnée à exporter")}


  switch(exportExt){
    case "csv":
      exportToCsv(exportArray);
    break;
    case "xlsx":
      ExportToExcel(exportArray,"xlsx");
    break;
    case "xls":
      ExportToExcel(exportArray,"xls");
    break;
    case "pdf":
      exportToPDF(exportArray);
    break;
    default:
      Error("Le format d'export n'est pas supporté")
  };
}

const handleImportOrExport = () => {
    
  switch(activeTab){
    case 0:
      Importing();
    break;
    case 1:
      Exporting();
    break;
    
  }
};
const downloadExample = (event:any) => {
  event.preventDefault();
  const headers = Headers.map((header) => header.key);
  const data = [headers];
  const csvContent = `data:text/csv;charset=utf-8,${data.map((e) => e.join(";")).join("")}`;
  // show the good format for é,è,à,ù,ç
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "Soventory_Example_format.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
}
  return (
    <div id="IEOverlay">
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth={maxWidth} fullWidth={fullWidth}>
        <DialogTitle id="form-dialog-title" >Import & Exportation</DialogTitle>
        <Tabs value={activeTab} color="rgb(85,0,85)" style={{color:"rgb(85,0,85)"}} onChange={handleTabChange}>
          <Tab label="Import" style={{color:"rgb(85,0,85)"}} />
          <Tab label="Export" style={{color:"rgb(85,0,85)"}} />
        </Tabs>
        <DialogContent className="root">
          {activeTab === 0 && 
          <div className="container">
      <h1>Import de fichier (csv,xlsx)</h1>
      <div id="form">
        <label>Sélectionne ton fichier</label>
        <div id="div_input_file"><input onChange={handleFileChange}  type="file" id="file" name="file" accept=".xlsx, .xls, .csv" /><Button onClick={downloadExample}><QuestionMarkIcon /></Button></div>
      </div>
      <div id="excel-preview" style={enableImport ? {display:'block'}:{display:"none"}}>
        <CsvPreview withId={false} data={fileArray} />
      </div>
    </div>}
          {activeTab === 1 && <div className="container">
        <h1>Export de fichier </h1>
        <div id="form">
          <label>Sélectionne l'extension</label>
          <div id="div_input_ext">
            <select  onChange={(v:any) => {
                setExportExt(v.target.value)
            } } value={exportExt} >
               {exportOptions.map((ext) => {
                return <option key={ext} value={ext}>{ext}</option>
              })}</select>
            </div>
            <div id="excel-preview" style={enableExport ? {display:'block'}:{display:"none"}}>
        <CsvPreview withId={true} data={exportArray} />
      </div>
        </div>
            </div>}
            {error && warningBar && <div className='error'><Warning open={warningBar} message={error} onClose={() => {setWarningBar(false)}} /></div> }
  </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" style={{color:"rgb(85,0,85)"}}>
            Annuler
          </Button>
          <Button onClick={handleImportOrExport} disabled={activeTab === 0 ? props.enable ? false : true : false} style={{color:"rgb(85,0,85)"}} color="primary">
            {activeTab === 0 ? "Importer" : "Exporter"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
  }