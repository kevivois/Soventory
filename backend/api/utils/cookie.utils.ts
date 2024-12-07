export function createCookie(name:string,value:string,req:Express.Request,res:any,maxAge:number | undefined) : any{

    if(!maxAge)
    {
        return res.cookie(name,value,{httpOnly:true,secure:true,sameSite:"Lax"})
        // if site is http, do not put secure:true
    }
    else{
        return res.cookie(name,value,{httpOnly:true,secure:true,sameSite:"Lax",maxAge:maxAge})
        // if site is http, do not put secure:true
    }
}