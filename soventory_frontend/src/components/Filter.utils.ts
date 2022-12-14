export class FilterMode {
    static readonly SORTING = "sorting";
    static readonly FILTERING = "filtering";
    static readonly SEARCHING = "searching";
}
export interface HeaderType{
    key:string;
    labelName:string;
    mode:number;
    sorting?:boolean;
    ordering?:boolean;
    order?:string;
    filter?:boolean;
    id:number;
    isDropDownList?:boolean,
    canEdit?:boolean,
    show?:boolean,
    inner?:boolean;
}
export interface IFilter{
    name:string
    header:HeaderType | null;
}
export class Filter implements IFilter {
    name:string
    header:HeaderType | null;
    constructor(name:string,header:HeaderType){
        this.name = name
        this.header = header
    }
}

export class Filtering implements Filter {
    name=FilterMode.FILTERING
    header:HeaderType;
    selectedValues:any[]
    constructor(header:HeaderType,selectedValues:string[]){
        this.header = header
        this.selectedValues = selectedValues
    }
}
export class Sorting implements Filter {
    name = FilterMode.SORTING;
    header:HeaderType;
    order:string
    constructor(header:HeaderType,order:string){
        this.header = header;
        this.order = order;
    }
}
export class Searching implements Filter {
    name = FilterMode.SEARCHING;
    header = null;
    value:string
    constructor(value:string){
        this.value = value;
    }
}
 

