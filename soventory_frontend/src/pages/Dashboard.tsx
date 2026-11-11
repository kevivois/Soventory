import React, { useState, useEffect } from 'react';
import TablePage from "./TablePage"
import { Routes, Route } from 'react-router-dom';
import SideBar from "../components/Sidebar"
import "react-pro-sidebar/dist/css/styles.css";
import "../components/style/Sidebar.scss"
import { useNavigate } from 'react-router-dom';
import { IconType } from 'react-icons/lib';
import {FaTachometerAlt} from "react-icons/fa"
import {CgOptions} from "react-icons/cg"
import {VscAccount} from "react-icons/vsc"
import {BsArchive} from "react-icons/bs"
import ProjectIcon from "../logo/plussegaush.png"
import getIp from '../IP';
const MODE={
    TABLE:1,
    ACCOUNT:2,
    PARAMETERS:3,
    FEEDBACK:4,
    ARCHIVE:5,
}
export default function Dashboard(props:{mode:number})
{
    const [mode,setMode] = useState<number>(props.mode);
    const [user,setUser] = useState<any>(null);
    const [content,setContent] = useState<JSX.Element | undefined>(<div>loading</div>);
    const [errorMessage,setErrorMessage] = useState<string>("");
    const naviguate = useNavigate();
    const pageTitle = {
        [MODE.TABLE]: "Inventaire",
        [MODE.ARCHIVE]: "Archives",
        [MODE.ACCOUNT]: "Mon compte",
        [MODE.PARAMETERS]: "Paramètres",
        [MODE.FEEDBACK]: "Retours",
    }[mode] || "Soventory";

    const isAdmin = (user:any) => {
        if(!user) return false;
        return user.droit == "ADMINISTRATEUR";
    }

    const menuOptions : {id:number,key:string,labelName:string,icon:IconType,onClickMenuitem:(which: number) => void,active:boolean,}[] = [
        {
            id:MODE.TABLE,
            key:"dashboard",
            labelName:"Tableau de bord",
            active:true,
            icon:FaTachometerAlt,
            onClickMenuitem:(which:number) => {
                 naviguate("/dashboard");
                 setMode(which);
            }
        },
        {
            id:MODE.ARCHIVE,
            key:"archives",
            labelName:"Archives",
            active:true,
            icon:BsArchive,
            onClickMenuitem:(which:number) => {
                 naviguate("/archives");
                 setMode(which);
            }
        },
        {
            id:MODE.ACCOUNT,
            key:"account",
            labelName:"Compte",
            active:false,
            icon:VscAccount,
            onClickMenuitem:(which:number) => {
                 naviguate("/account");
                 setMode(which);
            }
        },
        {
            id:MODE.PARAMETERS,
            key:"parameters",
            labelName:"Paramètres",
            active:false,
            icon:CgOptions,
            onClickMenuitem:(which:number) => {
                 naviguate("/parameters");
                 setMode(which);
            }
        },
    ]
    const renderTable = async () => {
        return (
            <div style={{width:"100%"}}>
            <TablePage type={"inventory"} user={user} />
            </div>
        );
    }
    const renderArchives = async () => {
        return (
                <TablePage type={"archive"} user={user} />
        );
    }
    const renderAccount = async () => {
        return (
            <div className="workspace-placeholder">
                <span className="workspace-eyebrow">ESPACE PERSONNEL</span>
                <h2>Votre compte</h2>
                <p>Connecté en tant que <strong>{user?.username}</strong>.</p>
            </div>
        );
    }
    const renderParameters = async () => {
        return (
            <div className="workspace-placeholder">
                <span className="workspace-eyebrow">CONFIGURATION</span>
                <h2>Paramètres</h2>
                <p>Les préférences de votre espace seront accessibles ici.</p>
            </div>
        );
    }
    async function renderScreen(which:number)
        {
            switch (which)
            {
                case MODE.TABLE:
                    return renderTable();
                case MODE.ACCOUNT:
                    return renderAccount();
                case MODE.PARAMETERS:
                    return renderParameters();
                case MODE.ARCHIVE:
                    return renderArchives();
            }
        }
    const disconnect = async () => {
        const query = await fetch(getIp()+"/user/logout",{
            credentials: "include",
            method: "POST"
        });
        const response = await query.json();
        if(response.message == "Logged out")
        {
            naviguate("/");
        }
    };
    useEffect(() => {
        async function fetchMe(){
            const query = await fetch(getIp()+"/user/me",{
                credentials: "include",
                method: "GET"
            });
            let response : any = {};
            try{
              response = await query.json();
            }catch(e){
                setUser(null);
                return setErrorMessage("ERROR");
            }
            if(!response.id || response.error ){
               setUser(null);
               return setErrorMessage(response.error);
            }
            setUser({id:response.id,username:response.nom_utilisateur,droit:response.droit});
            
        }
        async function load(){
            let content = await renderScreen(mode);
            setContent(content);
        }
        if(user){
            load();
        }
        else
        {
            fetchMe();
        }
        getUserFormats();
    },[mode,user]);
    function getUserFormats(){
        // get navigator language
        let dateTimeFormat = new Intl.DateTimeFormat();
        let language = dateTimeFormat.resolvedOptions().locale;
        if(!language.includes("fr")){
            console.warn(`Language '${language}' is not supported, please change to 'fr-FR' in your browser settings.`);
        }
    }

    const onIconClick = () => {
        window.location.replace("/dashboard");
    }
    return (
        <div className="workspace-shell">
            {user != null && errorMessage == "" ? (
                <>
                    <aside className="workspace-sidebar">
                        <SideBar menuIcon={ProjectIcon} collapsed={false} image={false} rtl={false} toggled={true} title={"Soventory"} options={menuOptions} disconnectFunction={disconnect} onIconClick={onIconClick} />
                    </aside>
                    <main className="workspace-main">
                        <header className="workspace-header">
                            <div>
                                <span className="workspace-eyebrow">ESPACE DE GESTION</span>
                                <h1>{pageTitle}</h1>
                            </div>
                            <div className="workspace-user">
                                <span className="workspace-user-mark">{user.username?.slice(0, 1).toUpperCase()}</span>
                                <span>
                                    <strong>{user.username}</strong>
                                    <small>{user.droit}</small>
                                </span>
                            </div>
                        </header>
                        <section className="workspace-content">{content}</section>
                    </main>
                </>
            ) : (
                <div className="workspace-loading" role="status">
                    <span className="workspace-loading-mark">S</span>
                    <p>{errorMessage || "Préparation de votre espace…"}</p>
                </div>
            )}
        </div>
    );
}