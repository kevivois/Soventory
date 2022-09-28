import React, { useState, useEffect } from 'react';
import TablePage from "./TablePage"
import { Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import SideBar from "../components/Sidebar"
import "react-pro-sidebar/dist/css/styles.css";
import "../components/style/Sidebar.scss"
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

    return <div><SideBar collapsed={false} image={false} handleToggleSidebar={onClickMenuitem} rtl={false} toggled={true} key={0}></SideBar>
   {content}</div>
}