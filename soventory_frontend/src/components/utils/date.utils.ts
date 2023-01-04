import Moment from "moment";

let DB_DATE_FORMAT = "yyyy-MM-DD";
let UI_DATE_FORMAT = "DD/MM/yyyy";

export function formatToDB(date: string): string {
    return Moment(date).format(DB_DATE_FORMAT);
}
export function formatToUI(date:string):string{
    return Moment(date, UI_DATE_FORMAT).format(DB_DATE_FORMAT);
}
export function addYear(year:number,date:string):string{
    return Moment(date, UI_DATE_FORMAT).add(year, "years").format(UI_DATE_FORMAT);
}