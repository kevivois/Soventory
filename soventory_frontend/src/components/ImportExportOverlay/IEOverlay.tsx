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
import {csvToObjectArray} from ".././utils/file.utils"; 
import CsvPreview	 from './CsvPreview';
import "./IEOverlay.css";
export default function ImportExportDialog(props:{buttonLabel:any,dialogTitle:any,open:boolean,onClose:() => void}) {
  const [open, setOpen] = useState(props.open);
  const [activeTab, setActiveTab] = useState(0); // 0 for import tab, 1 for export tab
  const [file, setFile] : any = useState<any>({}); // the selected file
  const [fileSize, setFileSize] = useState(0); // the size of the selected file in bytes
  const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('md');
  const [fullWidth, setFullWidth] = React.useState(true);
  const [fileSizeInGB,setFileSizeInGB] = useState(0)
  const [fileArray,setFileArray] = useState<[]>([])
  const [csvFile,setCsvFile] = useState<string>("")

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
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileSize(selectedFile.size);
    setFileSizeInGB(selectedFile.size/1000000000);
  };
  useEffect(() => {
    async function refresh(){
      if(file.name){
        await transformFile();
      }
    }
    refresh();
  }, [file])
  const transformFile = async () =>{

        var reader = new FileReader();
        await reader.readAsText(file, "UTF-8");
        // convert to show in table  format
        reader.onload = (e) => {
          let csv: string = reader.result as string;
          setCsvFile(csv);
          let result = csvToObjectArray(csv);
          setFileArray(result.data as []);
        }
        
  }

  const handleImport = () => {
    // Add code to import data here
    // You can access the file and file size with the file and fileSize state variables
    // You can check the file format and size and add the data to your application here
    handleClose();
  };

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
        <input onChange={handleFileChange}  type="file" id="file" name="file" accept=".csv, .xlsx" />
      </div>
      <div id="excel-preview" style={fileArray.length > 0 ? {display:'block'}:{display:"none"}}>
        <CsvPreview data={fileArray} />
      </div>
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