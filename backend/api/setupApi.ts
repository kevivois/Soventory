import mysql2 from "mysql2"
import ConnClass from "./Connection"
import userRoute from "./route/userRoute"
const Connection  = ConnClass.getInstance()
const cors = require("cors")
const express = require("express")
const PORT = 3001;
const app = express()
app.options('*', cors());
app.use(express.urlencoded({extended:true}))   
app.use(express.json());

app.use("/user",userRoute)



app.listen(PORT,() => {    
    console.log("Ecoute le port " + PORT);

})



