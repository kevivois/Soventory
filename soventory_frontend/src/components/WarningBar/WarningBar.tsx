import React,{useState,useEffect} from "react";
import { Collapse } from "@mui/material"; 
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close"
import Alert from "@mui/material/Alert";

export default function Warning(props:{message:string,open:boolean,onClose:()=>void}){

    function onClose(){
        
        props.onClose();
    }

    return (
    <Box sx={{ width: '100%' }}>
      <Collapse in={props.open}>
        <Alert variant="filled" severity="error" onClose={()=>{onClose()}}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                onClose();
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
         {props.message}
        </Alert>
      </Collapse>
    </Box>
    );
}