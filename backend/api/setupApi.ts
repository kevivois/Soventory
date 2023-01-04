import ConnClass from "./Connection"
import cookieParser from "cookie-parser"
import userRoute from "./route/userRoute"
import itemRoute from "./route/item/itemRoute"

import lieuRoute from"./route/item/lieu"
import etatRoute from "./route/item/etat"
import marqueRoute from "./route/item/marque"
import materielRoute  from"./route/item/materiel"
import sectionRoute from"./route/item/section"
import {handleCors} from "./middleware/cors"
import bodyParser from "body-parser"
import getIp from "../IP"
const Connection  = ConnClass.getInstance()
const cors = require("cors")
const express = require("express")
const PORT = 3001;
const app = express()

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin:["http://"+getIp()+":3000","http://localhost:3000"], // change after deployment
    credentials:true
}))
app.use(handleCors)


// get system language to determinate date format
let dateTimeFormat = new Intl.DateTimeFormat();
let language = dateTimeFormat.resolvedOptions().locale;
if(!language.includes("fr")){
    throw new Error("System language is not french")
}


app.use("/user",userRoute)
app.use("/item",itemRoute)

app.use("/item.lieu",lieuRoute)
app.use("/item.etat",etatRoute)
app.use("/item.marque",marqueRoute)
app.use("/item.materiel",materielRoute)
app.use("/item.section",sectionRoute)


app.listen(PORT,() => {    
    console.log("Ecoute le port " + PORT);

})



