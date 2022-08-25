import jwt from "jsonwebtoken"
const env = require("../env.json")

module.exports = (req:any,res:any,next:any) => {
    const token = req.header("token")
    if(!token) return res.status(401).send({
        error:"no token provided"
    })

    try
    {
        const user = jwt.verify(token,env.TOKEN_SECRET);
        req.user = user
    }
    catch(error)
    {
        return res.status(401).send({
            error:"token expired"
        })
    }
    next()
}
