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
const sizeLimitBytes = 3_000_000;

function getFileValidationError(rows:any[]):string | null {
  if(rows.length === 0) return "Le fichier est vide";
  const currentHeaders = Object.keys(rows[0]);
  return Headers.some((header) => !currentHeaders.includes(header.key))
    ? "Le fichier ne contient pas les bonnes colonnes"
    : null;
}

export default function ImportExportDialog(props:{open:boolean,onImport:(array:any) => void,onClose:() => void,exportArray:any[],exportheaders:any[],enable:boolean}) {
  const [open, setOpen] = useState(props.open);
  const [activeTab, setActiveTab] = useState(0); // 0 for import tab, 1 for export tab
  const [file, setFile] = useState<File | null>(null);
  const maxWidth: DialogProps['maxWidth'] = 'md';
  const fullWidth = true;
  const [fileArray,setFileArray] = useState<any[]>([])
  const [error,setError] = useState<string>("")
  const [enableImport,setEnableImport] = useState<boolean>(false)
  const [enableExport,setEnableExport] = useState<boolean>(false)
  const exportArray = props.exportArray;
  const [warningBar,setWarningBar] = useState<boolean>(false);
  const exportOptions = ["csv","xlsx","xls","pdf"];
  const [exportExt,setExportExt] = useState<string>(exportOptions[0]);

  useEffect(() => {
    if(activeTab === 1){
      setEnableExport(exportArray.length > 0);
    }
  },[exportArray,activeTab]);
  function showError(text:string){
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
    const selectedFile = event.target.files?.[0] as File | undefined;
    setError("");
    setWarningBar(false);
    setFileArray([]);
    setEnableImport(false);
    if(!selectedFile) return;
    if(!/\.(csv|xls|xlsx)$/i.test(selectedFile.name)){
      setFile(null);
      return showError("Le fichier n'est pas au bon format, formats acceptés : .csv, .xls, .xlsx");
    }
    if(selectedFile.size <= sizeLimitBytes){
    setFile(selectedFile);
  }else{
    setFile(null);
    showError("Le fichier est trop volumineux")
  }
  };
  useEffect(() => {
    if (!file) return;
    const selectedFile = file;
    const reader = new FileReader();
    reader.onerror = () => {
      setError("Impossible de lire le fichier sélectionné");
      setWarningBar(true);
    };
    reader.onload = () => {
      try {
        let csv: string;
        if (/\.(xls|xlsx)$/i.test(selectedFile.name)) {
          const workbook = XLSX.read(reader.result, { type: "array", cellDates: true, dateNF: "dd.mm.yyyy" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          if (!firstSheet) return showError("Le fichier Excel ne contient aucune feuille");
          csv = XLSX.utils.sheet_to_csv(firstSheet, { FS: ";", dateNF: "dd.mm.yyyy" });
        } else {
          csv = String(reader.result || "").replace(/^\uFEFF/, "");
        }
        const result = csvToObjectArray(csv);
        if (result.errors.length > 0) {
          setFileArray([]);
          setEnableImport(false);
          return showError(`Impossible de lire le fichier : ${result.errors[0].message}`);
        }
        const rows = result.data.filter((row:any) => Object.values(row).some((value) => value !== ""));
        const validationError = getFileValidationError(rows);
        setFileArray(rows);
        setEnableImport(validationError === null);
        if(validationError) {
          setError(validationError);
          setWarningBar(true);
        }
      } catch (error) {
        setFileArray([]);
        setEnableImport(false);
        setError(`Impossible de lire le fichier : ${error instanceof Error ? error.message : String(error)}`);
        setWarningBar(true);
      }
    };
    try {
      if (/\.(xls|xlsx)$/i.test(selectedFile.name)) reader.readAsArrayBuffer(selectedFile);
      else reader.readAsText(selectedFile, "UTF-8");
    } catch (error) {
      setFileArray([]);
      setEnableImport(false);
      setError(`Impossible de lire le fichier : ${error instanceof Error ? error.message : String(error)}`);
      setWarningBar(true);
    }
  }, [file]);

const Importing = () => {
    if(enableImport){
      handleClose();
      props.onImport(fileArray);
    }
}
const Exporting = () => {
  
  if(exportArray.length === 0){return showError("Aucune donnée à exporter")}


  switch(exportExt){
    case "csv":
      exportToCsv(exportArray, props.exportheaders);
    break;
    case "xlsx":
      ExportToExcel(exportArray,"xlsx", props.exportheaders);
    break;
    case "xls":
      ExportToExcel(exportArray,"xls", props.exportheaders);
    break;
    case "pdf":
      exportToPDF(props.exportheaders,exportArray);
    break;
    default:
      showError("Le format d'export n'est pas supporté")
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
  const csvContent = `\uFEFF${data.map((row) => row.join(";")).join("\r\n")}`;
  const encodedUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
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