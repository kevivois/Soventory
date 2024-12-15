export function createCookie(name:string,value:string,req:Express.Request,res:any,maxAge:number | undefined) : any{
    console.log("Creating cookies !!")
    if(!maxAge)
    {
        return res.cookie(name,value,{httpOnly:true,secure:true,sameSite:"None",domain:'soventory-api.onrender.com'})
        // if site is http, do not put secure:true
    }
    else{
        return res.cookie(name,value,{httpOnly:true,secure:true,sameSite:"None",maxAge:maxAge,domain:'soventory-api.onrender.com'})
        // if site is http, do not put secure:true  
    }
}