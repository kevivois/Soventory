import React, { useState, useEffect } from 'react';
import TablePage from "./TablePage"
import { Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import SideBar from "../components/Sidebar"
import "react-pro-sidebar/dist/css/styles.css";
import "../components/style/Sidebar.scss"
import { Navigate } from 'react-router-dom';
import {FaTachometerAlt} from "react-icons/fa"
import {FaGem} from "react-icons/fa"
import { useNavigate } from 'react-router-dom';
import { IconType } from 'react-icons/lib';
import {CgOptions} from "react-icons/cg"
import {VscAccount,VscFeedback} from "react-icons/vsc"
import {BsArchive} from "react-icons/bs"
import ProjectIcon from "../logo/plussegaush.png"
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
    const menuOptions : {id:number,key:string,labelName:string,icon:IconType,onClickMenuitem:(which: number) => void}[] = [
        {
            id:MODE.TABLE,
            key:"dashboard",
            labelName:"Dashboard",
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
            icon:BsArchive,
            onClickMenuitem:(which:number) => {
                 naviguate("/archives");
                 setMode(which);
            }
        },
        {
            id:MODE.ACCOUNT,
            key:"account",
            labelName:"Account",
            icon:VscAccount,
            onClickMenuitem:(which:number) => {
                 naviguate("/account");
                 setMode(which);
            }
        },
        {
            id:MODE.PARAMETERS,
            key:"parameters",
            labelName:"Parameters",
            icon:CgOptions,
            onClickMenuitem:(which:number) => {
                 naviguate("/parameters");
                 setMode(which);
            }
        },
        {
            id:MODE.FEEDBACK,
            key:"feedback",
            labelName:"Feedback",
            icon:VscFeedback,
            onClickMenuitem:(which:number) => {
                naviguate("/feedback");
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
            <div>
                <h1>Account</h1>
            </div>
        );
    }
    const renderParameters = async () => {
        return (
            <div>
                <h1>Parameters</h1>
            </div>
        );
    }
    const renderFeedback = async () => {
        return (
            <div>
                <h1>Feedback</h1>
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
                case MODE.FEEDBACK:
                    return renderFeedback();
                case MODE.ARCHIVE:
                    return renderArchives();
            }
        }
    const disconnect = async () => {
        const query = await fetch("http://localhost:3001/user/logout",{
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
            const query = await fetch("http://localhost:3001/user/me",{
                credentials: "include",
                method: "GET"
            });
            const response = await query.json();
            if(response.error){
               setUser(null);
               return setErrorMessage(response.error);
            }
            setUser({id:response.id,username:response.nom_utilisateur,droit:response.droit});
            console.log("setted user",response)
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
        
    },[mode,user]);
    return ( <div style={{display:"block",width:"100vw",height:"100%"}}> 
        {user != null && errorMessage == ""  ?  <div>
        <div style={{display:"inline-flex",flexDirection:"row",width:"15%"}}><SideBar menuIcon={ProjectIcon} collapsed={false} image={false} rtl={false} toggled={true} title={"Soventory"} options={menuOptions} disconnectFunction={disconnect} /></div>
        <div style={{display:"inline-flex",flexDirection:"row",width:"85%",float:"right"}}>{content}</div>
        </div> : <div>{errorMessage}</div>}</div>); 
}