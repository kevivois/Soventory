import React,{useState} from "react";
import { Collapse } from "@mui/material"; 
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close"
import Alert from "@mui/material/Alert";

export default function Warning(props:{message:string,open:boolean}){

    const [open,setOpen] = useState(props.open)

    return (
    <Box sx={{ width: '100%' }}>
      <Collapse in={open}>
        <Alert variant="filled" severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setOpen(false);
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