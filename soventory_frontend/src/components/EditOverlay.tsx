import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Modal from '@mui/material/Modal';
import { Box } from '@mui/system';
import React,{useEffect, useState} from 'react';
export default function EditOverlay(props:{id:number|null,onApply:(row:any) => void,deleteFunction:() => void,open:boolean}) 
{
    const [open,setOpen] = useState(props.open);
    const [deleteOpen,setDeleteOpen] = useState(false);
    const [editRow,setEditRow] = useState<any| null>(null);
    const handleClose = () => {
        setOpen(false);
    }
    const handleOpen = () => {
        setOpen(true);
    }
    const handleDeleteClose = () => {
        setDeleteOpen(false);
    }
    const handleDeleteOpen = () => {
        setDeleteOpen(true);
    }
    async function fetchItem()
    {
        const response = await fetch('http://localhost:3001/item/'+props.id,{
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        console.log(data)
        setEditRow(data[0]);
    }
    useEffect(() => {
        fetchItem();
    },[]);
    if(open && editRow != null)
    {
        return (
            <div>
                <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Edit</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Edit the row
                        </DialogContentText>
                        <Box sx={{display:'flex',flexDirection:'column'}}>
                            <Box sx={{display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
                                <Box sx={{display:'flex',flexDirection:'column',width:'50%'}}>
                                    <label>Product Name</label>
                                    <input type="text" value={editRow.id} onChange={(e) => {setEditRow({...editRow,id:e.target.value})}}/>
                                </Box>
                                <Box sx={{display:'flex',flexDirection:'column',width:'50%'}}>
                                    <label>Product Type</label>
                                    <input type="text" value={editRow.materiel} onChange={(e) => {setEditRow({...editRow,materiel:e.target.value})}}/>
                                </Box>
                            </Box>
                            <Box sx={{display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
                                <Box sx={{display:'flex',flexDirection:'column',width:'50%'}}>
                                    <label>Product Price</label>
                                    <input type="text" value={editRow?.productPrice} onChange={(e) => {setEditRow({...editRow,productPrice:e.target.value})}}/>
                                </Box>
                                <Box sx={{display:'flex',flexDirection:'column',width:'50%'}}>
                                    <label>Product Quantity</label>
                                    <input type="text" value={editRow.productQuantity} onChange={(e) => {setEditRow({...editRow,productQuantity:e.target.value})}}/>
                                </Box>
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={() => {props.onApply(editRow);handleClose()}} color="primary">
                            Apply
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={deleteOpen} onClose={handleDeleteClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Delete</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this row?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={() => {props.deleteFunction();handleDeleteClose()}} color="primary">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
    else 
    {
        return <div></div>
    }

}