export function createCookie(name:string,value:string,req:Express.Request,res:any,maxAge:number | undefined) : any{

    if(!maxAge)
    {
        return res.cookie(name,value,{httpOnly:false,secure:true,sameSite:"none"})
        // if site is http, do not put secure:true
    }
    else{
        return res.cookie(name,value,{httpOnly:true,secure:true,sameSite:"none",maxAge:maxAge})
        // if site is http, do not put secure:true
    }
}