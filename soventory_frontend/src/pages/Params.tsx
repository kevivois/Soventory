import React, { useEffect } from 'react';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { DataGrid} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { DialogContent } from "@mui/material";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from '@mui/material/DialogContentText';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './UsersList.css';

export default function Parameters(props:{user:any,allow:boolean}) {
  const [rows,setRows] = useState<any[]>([]);
  const [readOnly,setReadOnly] = useState(!props.allow);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState<string>("");
  const [userToDelete, setUserToDelete] = useState<number>(-1);
  const [deleteWarning, setDeleteWarning] = useState<boolean>(false);

  useEffect(() => {
    fetch('http://localhost:3001/user/all',{
        method: 'GET',
        credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (props.allow) {
          setUsers(data.users);
        } else {
          setError('You do not have permission to view this page.');
        }
      })
      .catch(err => {
        setError(err.message);
      });
  }, []);

  useEffect(() => {
    let tblRows:any[] = [];
    users.forEach((user:any) => {
      tblRows.push({
        id: user.id,
        nom_utilisateur: user.nom_utilisateur,
        droit: user.droit
      });
    });
    setRows(tblRows.filter((row:any) => row.id !== props.user.id));
  }, [users]);



  const DeleteButtonOnClick = () => {

    let d = users.find((user:any) => user.id === userToDelete);
    if(!d) return;
    fetch(`http://localhost:3001/user/${userToDelete}/delete`, { method: 'POST',credentials: 'include', })
      .then(res => res.json())
      .then(() => {
        setUsers(users.filter((user:any) => user.id !== userToDelete));
        setDeleteWarning(false);
        setUserToDelete(-1);
      })
      .catch(err => {
        setError(err.message);
        setDeleteWarning(false);
        setUserToDelete(-1);
      });
  };

  const EditButtonOnClick = (params:any) => {
    // modify user code goes here
    let userID = params.row.id;
  };
  const columns : any[] = [
    {   field: 'id', 
        headerName: 'id',  
        editable:false,
        align: "left",
        headerAlign:'left',
        width: 200,
        
    },
    {
        field:'nom_utilisateur',
        headerName:"Nom d'utilisateur",
        editable:true,
        align: "left" ,
        headerAlign:'left',
        width: 200
    },
    {
      field:'droit',
      headerName:'droit',
      editable:true,
      align: "left" ,
      headerAlign:'left',
      width: 200
  },
    {
        field:'Actions',
        headerName:'Action',
        editable:readOnly,
        renderCell: (params:any) => {
            return (
                <div>
                    <Button onClick={() =>{
                        EditButtonOnClick(params)
                    }}>
                        <EditIcon></EditIcon>
                    </Button>
                    <Button onClick={() => {
                        setUserToDelete(params.row.id);
                        setDeleteWarning(true);
                    }}>
                        <DeleteIcon></DeleteIcon>
                    </Button>
                </div>
            )
        },
        width: 200,
        align: "left" ,
        headerAlign:'left'
    },
  ];
  if(props.allow){
  return (
    <div>
    <div className='datagrid_container'>
          <Button >ADD USER<AddIcon></AddIcon></Button>
          <DataGrid   className="datagrid" columns={columns} rows={rows} />
      </div>
      <div className="DeleteWarning">
            {deleteWarning ?  <Dialog open={deleteWarning} onClose={() => setDeleteWarning(false)} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Delete</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Êtes-vous sûr de vouloir supprimer cette entrée (id: {userToDelete}) ?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteWarning(false)} color="primary">
                            Annuler
                        </Button>
                        <Button onClick={() => {DeleteButtonOnClick()}} color="primary">
                            Supprimer
                        </Button>
                    </DialogActions>
                </Dialog> : null}
        </div>
      </div>
      
  ); }
    else{
        return (
            <div>
                <h1>{error}</h1>
            </div>
        );
    }
}

