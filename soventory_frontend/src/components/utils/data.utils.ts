
export function H_DetermineRowPerPage(innerH:number): number{

let RATIO = 1/2;
let ROW_HEIGHT = 29;
return Math.floor((innerH*RATIO)/ ROW_HEIGHT);
}