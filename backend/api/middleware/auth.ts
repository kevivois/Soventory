
const env = require("../env.json")
const jwt = require("jsonwebtoken")
import ConnClass from "../Connection"
const Connection = ConnClass.getInstance()
import {verifyJWT} from "../utils/token.utils"
module.exports = async(req:any,res:any,next:any) => {

    const { accessToken, refreshToken } = req.cookies

    if (!accessToken && !refreshToken) {
        return res.status(401).send("Forbidden")
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
        console.log(verify)
        if (expiredAccessToken) {
            if (refreshToken) {
                const { user, expired } = verifyJWT(refreshToken)
                if (expired) {
                    return res.status(401).send("Forbidden")
                }
                else
                {
                    //check if refresh token is in database
                    var tokenQuery = await Connection.query(`select * from refreshtoken where token="${refreshToken}"`)
                    if(tokenQuery.length > 0)
                    {
                        //generate new access token
                        var newAccessToken = jwt.sign({id:user.id,droit:user.droit},env.TOKEN_SECRET,{expiresIn:"1m"})
                        req.user = user
                        console.log(user)
                        res.cookie("accessToken",newAccessToken,{httpOnly:true})
                        console.log("new access token generated")
                        return next()
                    }
                    else
                    {
                        console.log("Forbidden1")
                        return res.status(401).send("Forbidden")
                    }
                }
            } else {
                console.log("Forbidden2")
                return res.status(401).send("Forbidden")
            }
        }
        else
        {
            req.user = userAccessToken
            return next()
        }
    }
    else
    {
        console.log("Forbidden3")
        return res.status(401).send("Forbidden")
    }
}

