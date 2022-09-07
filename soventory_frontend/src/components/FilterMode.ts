export class FilterMode {
    static readonly SORTING = "sorting";
    static readonly FILTERING = "filtering";
    static readonly SEARCHING = "searching";
}
interface HeaderType{
    key:string;
    labelName:string;
    mode:number;
    sorting?:boolean;
    ordering?:boolean;
    order?:string;
    id:number;
}
export interface FilteringFilter {
    name:string
    header:HeaderType;
    selectedValues:any[];
}
export interface SortingFilter {
    name:string
    header:HeaderType;
    order:string;
    
}
export interface SearchingFilter {
    name:string
    header:HeaderType;
    value:string;
}

