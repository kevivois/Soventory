
export function H_DetermineRowPerPage(innerH:number): number{

let RATIO = 0.55
let ROW_HEIGHT = 33;
return Math.floor((innerH*RATIO)/ ROW_HEIGHT);
}