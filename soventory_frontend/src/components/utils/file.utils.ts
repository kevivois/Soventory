import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF, { TableConfig, TableRowData } from "jspdf";
const filename = 'Soventory_data';
export function csvToObjectArray(csvString:string) {
 
  return Papa.parse(csvString, {
    header: true,
    dynamicTyping: true,
    complete: function(results:any) {
      const arrayOfObjects = results.data;
    }
  });
  }

export function ExportToExcel(data:any[],extension:string){
  
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Soventory_data');
    let formated_date = new Date().toLocaleDateString().replace(/\//g, '-');
    return XLSX.writeFile(wb,`${filename}_${formated_date}_.${extension}`);

}
export function exportToCsv(data:any[]){
  let papaConfig = {
    header: true,
    delimiter: ';',
    
  }
  let csvData = Papa.unparse(data,papaConfig);
  let blob = new Blob([csvData], { type: 'text/csv' });
  let url= window.URL.createObjectURL(blob);
  let a = document.createElement('a');
  let formated_date = new Date().toLocaleDateString().replace(/\//g, '-');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}_${formated_date}_.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

}
export function exportToPDF(data:any[]){
  let pdf = new jsPDF();
  let formated_date = new Date().toLocaleDateString().replace(/\//g, '-');
  let headers = Object.keys(data[0]);
  //make small table config
  let tableConfig:TableConfig = {
    printHeaders: true,
    autoSize: true,
    margins: 2,
    fontSize: 2,
    headerBackgroundColor: '#000000',
    headerTextColor: '#ffffff',
    rowStart:(e:TableRowData,doc:jsPDF) => {
      if(e.row === 0){
        doc.setFontSize(10);
        doc.setTextColor(0,0,0);
      }
      else{
        doc.setFontSize(8);
        doc.setTextColor(0,0,0);
      }
    },
    cellStart:(e:TableRowData,doc:jsPDF) => {
      if(e.row === 0){
        doc.setFontSize(10);
        doc.setTextColor(0,0,0);
      }},
      css:{
        "font-size": 0.3
      }

  };
  pdf.table(1, 1, data, headers, tableConfig);
  pdf.save(`${filename}_${formated_date}_.pdf`);
  
 

}