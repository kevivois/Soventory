import React,{useEffect}from 'react';
import { useTable } from 'react-table';
import headers from '../headers';

export default function CsvPreview  ({ data }:any) {
  const [previewData, setPreviewData] = React.useState<any[]>(data.slice(0,50))
  useEffect(() => {
    setPreviewData(data.slice(0,50))
  }, [data])
  const columns = React.useMemo(
    () => headers.map((header:any) => {
      return {
        Header: header.labelName,
        accessor: header.key
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
    data:previewData
  });
  if (previewData[0]) {
    const csvColumnNames = Object.keys(previewData[0])
    const tableColumnNames = columns.map(column => column.accessor);
    if (!csvColumnNames.every((name:any) => tableColumnNames.includes(name)) || previewData.length < 1) {
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