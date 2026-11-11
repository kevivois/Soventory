import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from "jspdf";
import autoTable from  "jspdf-autotable"
const filename = 'Soventory_data';
type ExportHeader = { key: string; labelName?: string };

function exportRows(headers: ExportHeader[], data: any[]) {
  return data.map((row) => Object.fromEntries(
    headers.map(({key}) => {
      const value = row[key];
      return [key, value && typeof value === "object" && "nom" in value ? value.nom : value];
    })
  ));
}

function download(blob: Blob, extension: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  const formattedDate = new Date().toLocaleDateString().replace(/\//g, '-');
  link.setAttribute('hidden', '');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${formattedDate}_.${extension}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

export function csvToObjectArray(csvString:string) {
  return Papa.parse(csvString, { header: true, dynamicTyping: true, skipEmptyLines: true });
}

export function ExportToExcel(data:any[],extension:string,headers:ExportHeader[]){
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportRows(headers, data));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Soventory_data');
    const formattedDate = new Date().toLocaleDateString().replace(/\//g, '-');
    return XLSX.writeFile(wb,`${filename}_${formattedDate}_.${extension}`);
}

export function exportToCsv(data:any[],headers:ExportHeader[]){
  const papaConfig = {
    header: true,
    delimiter: ';',
  }
  const csvData = Papa.unparse(exportRows(headers, data), papaConfig);
  download(new Blob(['\uFEFF', csvData], { type: 'text/csv;charset=utf-8' }), 'csv');
}

export function exportToPDF(headers:ExportHeader[],data:any[]){
  const exportHeaders = headers.map((header) =>
    String(header.labelName || header.key).normalize('NFD').replace(/[\u0300-\u036f]/g, "")
  );
  let doc = new jsPDF('l','px','a4');
  const stringData = exportRows(headers, data).map((row) =>
    headers.map(({key}) => row[key] == null ? "" : String(row[key]))
  );
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
  let pages = Array.from({length: doc.getNumberOfPages()}, (_, i) => i + 1);

  pages.forEach(async (page) => {
    doc.setPage(page);
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text(Title,10,30,{align:"left"});
    doc.setFontSize(10);
    doc.text(`Page ${page.toString()}/${doc.getNumberOfPages()}`,doc.internal.pageSize.width/2,doc.internal.pageSize.height-20,{align:"center"});
  });
  download(doc.output('blob'), 'pdf');
}
