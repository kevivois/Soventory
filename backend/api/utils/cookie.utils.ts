export function createCookie(name:string,value:string,req:Express.Request,res:any,maxAge:number | undefined) : any{

    if(!maxAge)
    {
        return res.cookie(name,value,{httpOnly:false,sameSite:"lax"})
        // if site is http, do not put secure:true
    }
    else{
        return res.cookie(name,value,{httpOnly:false,sameSite:"lax",maxAge:maxAge})
        // if site is http, do not put secure:true
    }
}