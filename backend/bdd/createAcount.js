import getIp from "../IP"
const username = "kevin.voisin";
const psw = "1234";
const droit="ADMINISTRATEUR";


    fetch(getIp()+"/user/create",{
        method:"POST",
        body:JSON.stringify({nom_utilisateur:username,mot_de_passe:psw,droit:droit})
    }).then(rep => {
        console.log(rep)
        console.log("succefully created new account")
    })