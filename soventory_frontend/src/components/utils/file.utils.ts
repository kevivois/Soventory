import Papa from 'papaparse';
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
export function exportToPDF(data:any[]){
  let headers = Object.keys(data[0]) as any[];
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

  autoTable(doc, {
    head: [headers],
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
    },
    headStyles:{
      fillColor: [85,0,85]
    },
    margin: { horizontal: 10,top: 40,bottom: 30 },
  });

  var Title = `Exportation du ${new Date().toLocaleDateString()}`;
  for(let i = 1;i <= doc.getNumberOfPages();i++){
    doc.setPage(i);
    doc.setFontSize(20);
    doc.setTextColor(40);
    //doc.setFontStyle('normal');
    doc.text(Title,10,30,{align:"left"});
    // convert image url to base64
    (async () => {
    var imageData : any = await getBase64FromUrl(Icon_url);
    doc.addImage(imageData, 'JPEG', doc.internal.pageSize.width-50, 10, 50,50);
  })();
    doc.setFontSize(10);
     doc.text(`Page ${i.toString()}/${doc.getNumberOfPages()}`,doc.internal.pageSize.width/2,doc.internal.pageSize.height-20,{align:"center"});
   
  }

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


async function getBase64FromUrl(url:string) : Promise<string | ArrayBuffer | null>{
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob); 
    reader.onloadend = () => {
      const base64data = reader.result;   
      resolve(base64data);
    }
  });
}
