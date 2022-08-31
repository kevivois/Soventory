
const env = require("../env.json")
const jwt = require("jsonwebtoken")
import ConnClass from "../Connection"
const Connection = ConnClass.getInstance()
import {verifyJWT,signJWT} from "../utils/token.utils"
import {getRightOfUser} from "../utils/item.utils"
module.exports = async(req:any,res:any,next:any) => {

    const { accessToken, refreshToken } = req.cookies

    if (!accessToken && !refreshToken) {
        return res.status(401).send({"error":"Forbidden"})
    }
    if(accessToken)
    {
        if (accessToken == "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZHJvaXQiOiJBRE1JTklTVFJBVEVVUiIsImlhdCI6MTY2MTgwNjkxMywiZXhwIjoxNjYxODA2OTczfQ.S4ROQU1EtF1wLdk-_jfdSWSnNZD_sp45-0L_fVcBXBtzaSl9sqE-b-MGJlTlC0klEOe0lkb3EDf0eQ6F_kkuTM1055O9neCnD39XsOwnMSsLoVXGb5Vppv3mwxLtH7dNWTUhKQU5uDMIjKNVsSsYqucFvt-HbI9B8m0u1STTIpA")
        {
            console.log("okok")
        }
        const verify = verifyJWT(accessToken)
        const expiredAccessToken = verify.expired
        const userAccessToken = verify.user
        var droit = await getRightOfUser(userAccessToken.id)
        if (expiredAccessToken) {
            if (refreshToken) {
                const { user, expired } = verifyJWT(refreshToken)
                if(!droit || droit == "")
                {
                    droit = await getRightOfUser(verify.user.id)
                }
                if (expired) {
                    return res.status(401).send({"error":"Forbidden"})
                }
                else
                {
                    //check if refresh token is in database
                    var tokenQuery = await Connection.query(`select * from refreshtoken where token="${refreshToken}"`)
                    if(tokenQuery.length > 0)
                    {
                        //generate new access token
                        var newAccessToken = signJWT({id:user.id,droit:droit},"30m")
                        req.user = {id:user.id,droit:droit}
                        res.cookie("accessToken",newAccessToken,{httpOnly:true})
                        console.log("new access token generated")
                        return next()
                    }
                    else
                    {
                        return res.status(401).send({"error":"Forbidden"})
                    }
                }
            } else {
                return res.status(401).send({"error":"Forbidden"})
            }
        }
        else
        {
            req.user = {id:userAccessToken.id,droit:droit}
            return next()
        }
    }
    else
    {
        return res.status(401).send({"error":"Forbidden"})
    }
}

