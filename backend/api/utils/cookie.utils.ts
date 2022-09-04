export function createCookie(name:string,value:string,req:Express.Request,res:any,maxAge:number | undefined) : any{

    if(!maxAge)
    {
        return res.cookie(name,value,{httpOnly:true,sameSite:"lax"})
        // if site is http, do not put secure:true
    }
    else{
        return res.cookie(name,value,{httpOnly:true,sameSite:"lax",maxAge:maxAge})
        // if site is http, do not put secure:true
    }
}