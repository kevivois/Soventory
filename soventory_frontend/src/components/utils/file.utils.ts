import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF, { TableConfig, TableRowData } from "jspdf";
const PDFDocument = require('jspdf');
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
  let headers = Object.keys(data[0]);
  let doc = new jsPDF('l','px','a4');
  doc.setFontSize(10);
  //generateTable(doc,data,headers);
  let stringData :any[]= [];
  data.forEach((row:any) => {
    let nr:any = {};
    Object.keys(row).forEach((key:any) => {
      nr[key] = String(row[key]);

    })
    stringData.push(nr);

  })
  generateTable(doc,stringData,headers);

  // download it from client
  let blob = new Blob([doc.output()], { type: 'application/pdf' });
  let url= window.URL.createObjectURL(blob);
  let a = document.createElement('a');
  let formated_date = new Date().toLocaleDateString().replace(/\//g, '-');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}_${formated_date}_.pdf`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function generateTable(doc:jsPDF,data:any[],headers:any[]){
  let base_y = 50;
  let space_y = 20;
  let pages = 0;
  generateHeaders(doc,headers,base_y);
  data.forEach((row:any) => {
    let y = (data.indexOf(row)+1)*space_y+base_y - pages*doc.internal.pageSize.height;
    if(y >= doc.internal.pageSize.height - 30){
      doc.addPage();
      pages++;
    }
    generateRow(doc,row,headers,y)
  })
}

function generateHeaders(doc:jsPDF,headers:any[],y:number){
  headers.forEach((h) => {
    let base_space_x = 20;
    let row_length_px = 50;
    doc.text(h,headers.indexOf(h)*row_length_px+base_space_x,y,{align:'center'})
  })
}

function generateRow(doc:jsPDF,row:any,headers:any[],y:number){
  headers.forEach((h:any) =>{
    let base_space_x = 20;
    let row_length_px = 50;
    // generate new page if row exceeds page height
    doc.text(row[h],headers.indexOf(h)*row_length_px+base_space_x,y,{align:'center'})
  })
}
