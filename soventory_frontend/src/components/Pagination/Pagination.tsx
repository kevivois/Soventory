import React, { useEffect, useState } from 'react'
import { Button } from '@mui/material'
export default function Pagination(props:{onPageChange:(page:number) => void,enabled:boolean,page:number,maxPage:number}){

    function onPrevious(){
        props.onPageChange(props.page - 1)
    }
    function onNext(){
        props.onPageChange(props.page + 1)
    }
    console.log(props.maxPage)
    if(props.enabled){
        return (<div className="pagination">
            <Button onClick={onPrevious} disabled={props.page === 1 || !props.enabled}>Précedant</Button>
            <span>{props.page}</span>
            <span> sur </span>
            <span>{props.maxPage}</span>
            <Button onClick={onNext} disabled={props.page >= props.maxPage|| !props.enabled}>Suivant</Button>
        </div>)
        }
    else{
        return <></>
    }
}