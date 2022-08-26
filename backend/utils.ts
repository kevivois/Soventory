export function FormatNumberLength(num:number, length:number) : string {
    var r = "" + num;
    while (r.length < length) {
        r = "0" + r;
    }
    return r;
}