import { Request, Response } from "express"

export function createCookie(name:string,value:string,req:Request,res:Response,maxAge:number | undefined) {
    return res.cookie(name,value,{
        httpOnly:true,
        secure:true,
        sameSite:"none",
        ...(maxAge === undefined ? {} : {maxAge})
    })
}