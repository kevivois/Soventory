import React from 'react';
import { Routes ,Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from "./Dashboard";
const MODE={
    TABLE:1,
    ACCOUNT:2,
    PARAMETERS:3,
    FEEDBACK:4,
    ARCHIVE:5,
}
export default  function Main()
{
    return (
        <div>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard mode={MODE.TABLE} />} />
                <Route path="/archives" element={<Dashboard mode={MODE.ARCHIVE} />} />
                <Route path="/account" element={<Dashboard mode={MODE.ACCOUNT} />} />
                <Route path="/parameters" element={<Dashboard mode={MODE.PARAMETERS} />} />
                <Route path="/feedback" element={<Dashboard mode={MODE.FEEDBACK} />} />
            </Routes>
        </div>
    );
}
