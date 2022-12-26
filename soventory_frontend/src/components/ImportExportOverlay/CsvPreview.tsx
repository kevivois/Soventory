import React from 'react';
import { useTable } from 'react-table';

export default function CsvPreview  ({ data }:any) {
  const columns = React.useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'id'
      },
      {
        Header: 'Materiel',
        accessor: 'materiel'
      },
      {
        Header: 'Marque',
        accessor: 'marque'
      },
      {
        Header: 'Modele',
        accessor: 'modele'
      },
      {
        Header: 'Num Serie',
        accessor: 'num_serie'
      },
      {
        Header: 'Num Produit',
        accessor: 'num_produit'
      },
      {
        Header: 'Section',
        accessor: 'section'
      },
      {
        Header: 'Etat',
        accessor: 'etat'
      },
      {
        Header: 'Lieu',
        accessor: 'lieu'
      },
      {
        Header: 'Remarque',
        accessor: 'remarque'
      },
      {
        Header: 'Date Achat',
        accessor: 'date_achat'
      },
      {
        Header: 'Garantie',
        accessor: 'garantie'
      },
      {
        Header: 'Fin Garantie',
        accessor: 'fin_garantie'
      },
      {
        Header: 'Prix',
        accessor: 'prix'
      },
      {
        Header: 'Archive',
        accessor: 'archive'
      }
    ],
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
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
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