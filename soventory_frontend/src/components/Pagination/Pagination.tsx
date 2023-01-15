import React, { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
export default function Pagination(props:{onPageChange:(page:number) => void,enabled:boolean,page:number,maxPage:number}){

    function onPrevious(){
        props.onPageChange(props.page - 1)
    }
    function onNext(){
        props.onPageChange(props.page + 1)
    }
    if(props.enabled){
        return (<div className="pagination">
            <Button className="pageButton" sx={{color:"#f13dbe"}} onClick={onPrevious} disabled={props.page === 1 || !props.enabled}>< NavigateBeforeIcon /></Button>
            <span>{props.page}</span>
            <span> sur </span>
            <span>{isFinite(props.maxPage) ? props.maxPage : 0 }</span>
            <Button className="pageButton" sx={{color:"#f13dbe"}} onClick={onNext} disabled={props.page >= props.maxPage|| !props.enabled}>< NavigateNextIcon /></Button>
        </div>)
        }
    else{
        return <></>
    }
}