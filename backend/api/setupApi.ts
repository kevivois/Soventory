
import ConnClass from "./Connection"

import userRoute from "./route/userRoute"
import itemRoute from "./route/item/itemRoute"

import lieuRoute from"./route/item/lieu"
import etatRoute from "./route/item/etat"
import marqueRoute from "./route/item/marque"
import materielRotue  from"./route/item/materiel"
import sectionRoute from"./route/item/section"

const Connection  = ConnClass.getInstance()
const cors = require("cors")
const express = require("express")
const PORT = 3001;
const app = express()
app.options('*', cors());
app.use(express.urlencoded({extended:true}))   
app.use(express.json());
app.use("/user",userRoute)
app.use("/item",itemRoute)

app.use("/item.lieu",lieuRoute)
app.use("/item.etat",etatRoute)
app.use("/item.marque",marqueRoute)
app.use("/item.materiel",materielRotue)
app.use("/item.section",sectionRoute)


app.listen(PORT,() => {    
    console.log("Ecoute le port " + PORT);

})



