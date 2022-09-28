import React, { useState, useEffect } from 'react';
import TablePage from "./TablePage"
import { Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import SideBar from "../components/Sidebar"
import "react-pro-sidebar/dist/css/styles.css";
import "../components/style/Sidebar.scss"
import {FaTachometerAlt} from "react-icons/fa"
import {FaGem} from "react-icons/fa"
import { IconType } from 'react-icons/lib';
const MODE={
    TABLE:1,
    ACCOUNT:2,
    PARAMETERS:3,
    FEEDBACK:4,
}

export default function Dashboard()
{
    const [mode,setMode] = useState<number>(MODE.TABLE);
    const [content,setContent] = useState<JSX.Element | undefined>(<div>loading</div>);
    const menuOptions : {id:number,key:string,labelName:string,icon:IconType,onClickMenuitem:(which: number) => void}[] = [
        {
            id:1,
            key:"dashboard",
            labelName:"Dashboard",
            icon:FaTachometerAlt,
            onClickMenuitem:(which:number) => {
                setMode(which);
            }
        },
        {
            id:2,
            key:"account",
            labelName:"Account",
            icon:FaGem,
            onClickMenuitem:(which:number) => {
                setMode(which);
            }
        },
        {
            id:3,
            key:"parameters",
            labelName:"Parameters",
            icon:FaGem,
            onClickMenuitem:(which:number) => {
                setMode(which);
            }
        },
        {
            id:4,
            key:"feedback",
            labelName:"Feedback",
            icon:FaGem,
            onClickMenuitem:(which:number) => {
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
        


    useEffect(() => {
        async function load(){
            let content = await renderScreen(mode);
            console.log(mode)
            setContent(content);
        }
        load();
        
    },[mode])

    const onClickMenuitem = async (which:number) => {
        console.log(which);
    }
    
    return <div style={{display:"block",width:"100vw"}}>
        <div style={{display:"inline-flex",flexDirection:"row",width:"15%"}}><SideBar collapsed={false} image={false} handleToggleSidebar={onClickMenuitem} rtl={false} toggled={true} title={"Menu"} options={menuOptions} /></div>
        <div style={{display:"inline-flex",flexDirection:"row",width:"85%",float:"right"}}>{content}</div>
        </div>
}