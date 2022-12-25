import Papa from 'papaparse';

export function csvToObjectArray(csvString:string) {
 
  return Papa.parse(csvString, {
    header: true,
    dynamicTyping: true,
    complete: function(results:any) {
      const arrayOfObjects = results.data;
      console.log(arrayOfObjects);
    }
  });
  }