import React,{useState,useEffect} from "react"
import HeaderMode from "./Mode";
import TextField from "@mui/material/TextField";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import {FilteringFilter,SortingFilter,SearchingFilter} from "./FIlterMode";
import Headers from "./headers"
import "./style/TableStyle.css"
export default function DataTable(props:{data:any[]})
{
    const [data, setData] = useState<any[]>(props.data);
    const [headers,setHeaders] = useState<typeof Headers>(Headers)
    const [filteredData,setFilteredData] = useState<any[]>(data);
    const [filterList,setFilterList] = useState<any[]>([]);

    useEffect(() => {
        filterList.forEach((filter)=>{
            if(filter.name==="filtering")
            {
                var filtering : FilteringFilter = filter;
            }
            else if(filter.name==="sorting")
            {
                var sorting : SortingFilter = filter;
            }
            else if(filter.name==="searching")
            {
                var searching : SearchingFilter = filter;
                onSearchTextChange(searching.value);
            }
        })


    },[...filterList,filterList.length,filterList])

    const AddNewFilter = (filter:any) => {
        var newFilterList = [...filteredData];

        if(filter.name === "searching")
        {
            //check if there is a searching filter
            var searchingFilter = newFilterList.find((filter)=>filter.name==="searching");
            if(searchingFilter)
            searchingFilter.value = filter.value;
        }
        else
        {
            newFilterList.push(filter);
        }
        setFilterList(newFilterList);
    }

    const onSearchTextChange = (text:any) => {
        function eachData(filterText:any,data:any) :boolean
        {
            var result = false;
            Object.values(data).forEach((value) => {
                const vl = String(value).toLowerCase();
                    if (vl.includes(filterText.toLowerCase()))
                    {
                        result =  true;
                    }
            });
            return result;
        }
        var newData = [...data];
        newData = [];
        data.forEach((dt) => {
          if (eachData(text,dt)) {
            newData.push(dt);
          }
        });
        setFilteredData(newData);
      };
    const orderByHeader = (header:any) => {
        const newHeaders = [...headers];
        newHeaders.forEach((h) => {
            if (h.key === header.key) {
                h.order = h.order === "asc" ? "desc" : "asc";
            }
        });
        setHeaders(newHeaders);
        const newFilteredData = [...filteredData];
        newFilteredData.sort((a, b) => {
            if (a[header.key] < b[header.key]) {
                return header.order === "asc" ? -1 : 1;
            }
            if (a[header.key] > b[header.key]) {
                return header.order === "asc" ? 1 : -1;
            }
            return 0;
        });
        setFilteredData(newFilteredData);
    };

      const onClickSetMode = (header:any, mode:any) => {
        var newHeaders = [...headers];
    
        var newHeader : typeof header;
    
        newHeaders.forEach((h) => {
          if (h.key === header.key && h.mode === header.mode) {
            newHeader = h;
          }
        });
        var indexof = newHeaders.indexOf(newHeader);
        newHeader.mode = mode;
        newHeaders[indexof] = newHeader;
    
        setHeaders(newHeaders);
      };

    return (
        <div className="App">
            <div className="SearchBar">
            <TextField
            id="outlined-basic"
            variant="outlined"
            fullWidth
            label="Search"
            onChange={(event) => onSearchTextChange(event.target.value)}/>
            </div>
            <div className="table">
        <table>
            <thead>
                <tr>
                    {headers.map((header) => {
                        if(header.mode == HeaderMode.FILTER)
                        {
                            return (<th key={header.id}>{header.labelName}</th>)
                        }
                        else{
                            if(header.filter !== undefined && header.filter == true)
                            {
                                return (<th key={header.id}>{header.labelName}<FilterAltIcon style={{float:"right"}} /></th>)
                            }
                            else if(header.ordering !== undefined && header.ordering == true)
                            {
                                const icon = header.order === "asc" ? "▲" : "▼";
                                return (<th onClick={() => orderByHeader(header)} key={header.id}>{header.labelName}{icon}</th>)
                            }
                            else
                            {
                                return (<th key={header.id}>{header.labelName}</th>)
                            }
                            
                        }
                       
                        })}
                </tr>
            </thead>
            <tbody>
                {filteredData.map((row) => {
                    return (
                        <tr key={row.id}>
                            {headers.map((header) => {
                                return (<td key={header.id}>{row[header.key]}</td>)
                            })}
                        </tr>
                    )
                })}
             </tbody>
            </table>
            </div>
        </div>
    );
}