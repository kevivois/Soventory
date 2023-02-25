import Papa from 'papaparse';
import base64 from 'react-native-base64'
import * as XLSX from 'xlsx';
import Icon_url from "../../logo/plussegaush.jpeg"
import jsPDF, { TableConfig, TableRowData } from "jspdf";
import autoTable from  "jspdf-autotable"
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
export function exportToPDF(headers:any[],data:any[]){
  let exportHeaders = headers.map((header:any) => {
    // remove accents due to jsPdf library utf8 unsupported characters
    return String(header.labelName).normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    })
  let doc = new jsPDF('l','px','a4');
  let stringData : any[]= [];
  data.forEach((row:any) => {
    let nr:any[] = [];
    Object.keys(row).forEach((key:any) => {
      nr.push(row[key]);

    })
    stringData.push(nr);

  })
  // start from a margin of 50px
  
  doc.setFont('Helvetica');
  doc.setFontSize(10);
  autoTable(doc, {
    head: [exportHeaders],
    body: stringData,
    theme: 'striped',
    styles: {
      overflow: 'linebreak',
      fontSize: 7,
      cellPadding: 1,
      halign: 'center',
      valign: 'middle',
      cellWidth: 'wrap',
      minCellHeight: 10,
      font: 'helvetica',
      
    },
    headStyles:{
      fillColor: [85,0,85]
    },
    margin: { horizontal: 10,top: 40,bottom: 30 },
  });

  var Title = `Exportation du ${new Date().toLocaleDateString()}`;
  /*create an array size of page */
  var img = new Image();
  img.src = Icon_url;
  var imgData = base64.encode(img.src);
  let pages = Array.from({length: doc.getNumberOfPages()}, (_, i) => i + 1);

  pages.forEach(async (page) => {
    doc.setPage(page);
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text(Title,10,30,{align:"left"});
    doc.setFontSize(10);
    doc.text(`Page ${page.toString()}/${doc.getNumberOfPages()}`,doc.internal.pageSize.width/2,doc.internal.pageSize.height-20,{align:"center"});
    //await doc.addImage(imgData,'JPEG',doc.internal.pageSize.width-50,50,40,40);
  });

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
