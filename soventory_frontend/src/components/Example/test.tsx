//creating a table with filter foreach column
import React, { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export default function Table(data:any[],column:any[])
{
  const [filterInput, setFilterInput] = React.useState('');
  const [filteredData, setFilteredData] = React.useState(data);

  useEffect(() => {
    setFilteredData(
      data.filter((entry) =>
        entry.name.toLowerCase().includes(filterInput.toLowerCase())
      )
    );
  }, [filterInput, data]);

  // render a table in html foreach data with  a select popup filter for each column
  return (
    <div>
      <input
        value={filterInput}
        onChange={(e) => setFilterInput(e.target.value)}
        placeholder={'Search name'}
      />
      <table>
        <thead>
          <tr>
            {column.map((heading) => (
              <th>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
            <tr>
              {column.map((column) => (
                <td>{row[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}