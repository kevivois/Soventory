import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF, { TableConfig, TableRowData } from "jspdf";
const PDFDocument = require('@react-pdf/pdfkit');
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
  let doc = new jsPDF('p','px','a4');
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
 console.log(stringData)     
  doc.table(10,50,stringData,headers,{autoSize:false})
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
  let base = 50;
  generateHeaders(doc,headers,base);
  data.forEach((row:any) => {
    generateRow(doc,row,headers,(data.indexOf(row)+1)*40+base)
  })
}

function generateHeaders(doc:jsPDF,headers:any[],y:number){
  headers.forEach((h) => {
    doc.text(h,headers.indexOf(h)*40,y,{maxWidth:120,align:'center'});
  })
}

function generateRow(doc:jsPDF,row:any,headers:any[],y:number){

  headers.forEach((h:any) =>{
    doc.text(String(row[h]),headers.indexOf(h)*40,y,{maxWidth:120,align:'center'})
  })
  

}
