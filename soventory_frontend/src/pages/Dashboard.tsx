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
const MODE={
    TABLE:1,
    ACCOUNT:2,
    PARAMETERS:3,
    FEEDBACK:4,
}

export default function Dashboard(props:{mode:number})
{
    const [mode,setMode] = useState<number>(props.mode);
    const [content,setContent] = useState<JSX.Element | undefined>(<div>loading</div>);
    const naviguate = useNavigate();
    const menuOptions : {id:number,key:string,labelName:string,icon:IconType,onClickMenuitem:(which: number) => void}[] = [
        {
            id:1,
            key:"dashboard",
            labelName:"Dashboard",
            icon:FaTachometerAlt,
            onClickMenuitem:(which:number) => {
                 naviguate("/dashboard");
                 setMode(which);
            }
        },
        {
            id:2,
            key:"account",
            labelName:"Account",
            icon:VscAccount,
            onClickMenuitem:(which:number) => {
                 naviguate("/account");
                 setMode(which);
            }
        },
        {
            id:3,
            key:"parameters",
            labelName:"Parameters",
            icon:CgOptions,
            onClickMenuitem:(which:number) => {
                 naviguate("/parameters");
                 setMode(which);
            }
        },
        {
            id:4,
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
            <TablePage />
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
        console.log(response);
    };
        


    useEffect(() => {
        async function load(){
            let content = await renderScreen(mode);
            setContent(content);
        }
        load();
        
    },[mode])

    
    return <div style={{display:"block",width:"100vw"}}>
        <div style={{display:"inline-flex",flexDirection:"row",width:"15%"}}><SideBar collapsed={false} image={false} rtl={false} toggled={true} title={"Menu"} options={menuOptions} disconnectFunction={disconnect} /></div>
        <div style={{display:"inline-flex",flexDirection:"row",width:"85%",float:"right"}}>{content}</div>
        </div>
}