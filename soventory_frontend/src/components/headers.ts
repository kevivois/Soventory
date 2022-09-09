import HeaderMode from "./Mode";
const headers = [
    {
        key:"id",
        labelName:"Id",
        mode:HeaderMode.DEFAULT,
        sorting:true,
        ordering:true,
        order:"asc",
        id:0
    },
    {
        key:"materiel",
        labelName:"Materiel",
        mode:HeaderMode.DEFAULT,
        filter:true,
        id:1
    },
    {
        key:"marque",
        labelName:"Marque",
        filter:true,
        mode:HeaderMode.DEFAULT,

        id:2
    },
    {
        key:"modele",
        labelName:"Modèle",
        filter:true,
        mode:HeaderMode.DEFAULT,

        id:3
    },
    {
        key:"num_serie",
        labelName:"Numéro de série",
        mode:HeaderMode.DEFAULT,

        id:4
    },
    {
        key:"num_produit",
        labelName:"Numéro de produit",
        mode:HeaderMode.DEFAULT,

        id:5
    },
    {
        key:"section",
        labelName:"Section",
        mode:HeaderMode.DEFAULT,

        id:6
    },
    {
        key:"etat",
        labelName:"Etat",
        filter:true,
        mode:HeaderMode.DEFAULT,

        id:7
    },
    {
        key:"lieu",
        labelName:"Lieu",
        filter:true,        
        mode:HeaderMode.DEFAULT,

        id:8
    },
    {
        key:"remarque",
        labelName:"Remarque",
        mode:HeaderMode.DEFAULT,

        id:9
    },
    {
        key:"date_achat",
        labelName:"Date d'achat",
        mode:HeaderMode.DEFAULT,

        id:10
    },
    {
        key:"garantie",
        labelName:"Garantie",
        mode:HeaderMode.DEFAULT,

        id:11
    },
    {
        key:"fin_garantie",
        labelName:"Fin de garantie",
        mode:HeaderMode.DEFAULT,

        id:12
        
    },
    {
        key:"prix",
        labelName:"Prix",
        mode:HeaderMode.DEFAULT,

        id:13
    }
]
export default headers;