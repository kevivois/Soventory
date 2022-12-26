
const env = require("../env.json")
const jwt = require("jsonwebtoken")
import ConnClass from "../Connection"
const Connection = ConnClass.getInstance()
import {verifyJWT,signJWT} from "../utils/token.utils"
import {getRightOfUser} from "../utils/item.utils"
import {createCookie} from "../utils/cookie.utils"
module.exports = async(req:any,res:any,next:any) => {

    const { accessToken, refreshToken } = req.cookies
    if (!accessToken && !refreshToken) {
        return res.status(401).send({"error":"Forbidden"})
    }
    if(accessToken)
    {
        const verify = verifyJWT(accessToken)
        const expiredAccessToken = verify.expired
        const userAccessToken = verify.user
        var droit = ""
        if(userAccessToken)
        {
            droit = await getRightOfUser(userAccessToken.id)
        }
        if (expiredAccessToken) {
            if (refreshToken) {
                const { user, expired } = verifyJWT(refreshToken)
                if(!droit || droit == "")
                {
                    droit = await getRightOfUser(user.id)
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
                        createCookie("accessToken",newAccessToken,req,res,undefined)
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
        else if(userAccessToken)
        {
            req.user = {id:userAccessToken.id,droit:droit}
            return next()
        }
        else
        {
            return res.status(401).send({"error":"Forbidden"})
        }
    }
    else
    {
        return res.status(401).send({"error":"Forbidden"})
    }
}

