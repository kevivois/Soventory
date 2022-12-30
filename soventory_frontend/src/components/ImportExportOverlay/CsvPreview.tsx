import React from 'react';
import { useTable } from 'react-table';
import headers from '../headers';

export default function CsvPreview  ({ data,withId }:any) {
  const columns = React.useMemo(
    () => headers.map((header:any) => {
      return {
        Header: header.labelName,
        accessor: header.key
      }
    }).filter((header:any) => {
      if(withId === true){
        return true;
      }else{
        return header.accessor !== "id"
      }
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  });
  if (data[0]) {
    const csvColumnNames = Object.keys(data[0])
    const tableColumnNames = columns.map(column => column.accessor);
    if (!csvColumnNames.every((name:any) => tableColumnNames.includes(name))) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center' ,width:"100%",height:"100%"}}>
          preview non disponible
        </div>
      );
    }
  }
  return (
    <table style={{
      width:"100%",
      height:"100%", 
      borderCollapse: 'collapse',
      overflow:"auto",
    }} {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()} style={{ height:"5%",borderBottom: 'solid 1px black', background: 'aliceblue', color: 'black', fontWeight: 'bold',borderRight: 'solid 1px gray'
              }}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} style={{
              borderBottom: 'solid 1px gray',
            }}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
    };