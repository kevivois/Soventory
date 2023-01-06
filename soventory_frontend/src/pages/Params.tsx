import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableRow, Button } from '@mui/material';

import './UsersList.css';

export default function Parameters(props:{user:any,allow:boolean}) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState<string>("");

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

  const handleDelete = (userId:string) => {
    return
    fetch(`http://localhost:3001/user/${userId}`, { method: 'DELETE',credentials: 'include', })
      .then(res => res.json())
      .then(() => {
        setUsers(users.filter((user:any) => user.id !== userId));
      })
      .catch(err => {
        setError(err.message);
      });
  };

  const handleModify = (user:any) => {
    // modify user code goes here
  };
  if(props.allow){
  return (
    <div className="users-list">
      <Table>
        <TableBody>
          {users.map((user:any) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.nom_utilisateur}</TableCell>
              <TableCell>{user.droit}</TableCell>
              <TableCell>
                <Button onClick={() => handleModify(user)}>Modify</Button>
                <Button onClick={() => handleDelete(user.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
