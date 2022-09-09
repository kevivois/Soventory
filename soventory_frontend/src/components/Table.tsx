import React,{useState,useEffect} from "react"
import HeaderMode from "./Mode";
import TextField from "@mui/material/TextField";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import {Filtering,Searching,Sorting,Filter,HeaderType} from "./Filter.utils";
import Headers from "./headers"
import "./style/TableStyle.css"
export default function DataTable(props:{data:any[]})
{
    const [data, setData] = useState<any[]>(props.data);
    const [headers,setHeaders] = useState<typeof Headers>(Headers)
    const [filteredData,setFilteredData] = useState<any[]>(data);
    const [renderedData,setRenderedData] = useState<any[]>(data);
    const [filterList,setFilterList] = useState<any[]>([]);

    useEffect(() => {
        
        filterList.forEach((filter:Filter)=>{
           if(filter instanceof  Filtering)
           {
            ApplyFilteringFilter(filter);
           }
        })
        filterList.forEach((filter:Filter)=>{
            if(filter instanceof  Searching)
            {
             ApplySearchingFilter(filter);
            }
            else if(filter instanceof Sorting)
            {
                ApplySortingFilter(filter);
            }
         })


    },[...filterList])

    useEffect(() => {
        // creating an filter by value filter test
        //let filter = new Filtering(headers[4],["WEIURHWEU"]);
        // adding the filter to the filter list
        //AddNewFilter(filter);
    },[])

    const ApplyFilteringFilter = (filter:Filtering)=>
    {
        console.log("a")
        let selectedValues = filter.selectedValues;
        let header = filter.header;
        let newData : any[] = []
        selectedValues.forEach((value:string)=>{
            newData.push(...data.filter((item:any)=>item[header.key]===value))
        })
        setFilteredData(newData);
    }
    const ApplySortingFilter = (filter:Sorting)=>
    {
            console.log("sorting")
            const newHeaders = [...headers];
            newHeaders.forEach((h) => {
                if (h.key === filter.header.key) {
                    h.order = h.order === "asc" ? "desc" : "asc";
                }
            });
            setHeaders(newHeaders);
            const newFilteredData = [...filteredData];
            newFilteredData.sort((a, b) => {
                if (a[filter.header.key] < b[filter.header.key]) {
                    return filter.header.order === "asc" ? -1 : 1;
                }
                if (a[filter.header.key] > b[filter.header.key]) {
                    return filter.header.order === "asc" ? 1 : -1;
                }
                return 0;
            });
            setRenderedData(newFilteredData);
    }
    const ApplySearchingFilter = (filter:Searching)=>
    {
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
        filteredData.forEach((dt) => {
          if (eachData(filter.value,dt)) {
            newData.push(dt);
          }
        });
       
        setRenderedData(newData);
    }
    const AddNewFilter = (filter:Filter) => {
        var newFilterList = [...filteredData];

        if(filter instanceof Searching)
        {
            //check if there is a filtering filter with the same header
            var index = newFilterList.findIndex((flt:Filter)=>flt instanceof Searching);
            if(index !== -1)
            {
                newFilterList[index] = filter;
            }
            else
            {
                newFilterList.push(filter);
            }

        }
        else if(filter instanceof Filtering)
        {
           //check if there is a filtering filter with the same header
              var index = newFilterList.findIndex((flt:Filter)=> flt.header === filter.header);
              
                if(index !== -1)
                {
                    newFilterList[index] = filter;
                }
                else
                {
                    newFilterList.push(filter);
                }
        }
        else if(filter instanceof Sorting)
        {
           //check if there is a filtering filter with the same header
                var index = newFilterList.findIndex((flt:Filter)=> {
                    return flt.header == filter.header
                });
                if(index !== -1)
                {
                    newFilterList[index] = filter;
                }
                else
                {
                    newFilterList.push(filter);
                }
        }
        setFilterList(newFilterList);
    }

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
      const onClickFilterPopupOpen = (header:any) => {
        
      };

    return (
        <div className="App">
            <div className="SearchBar">
            <TextField
            id="outlined-basic"
            variant="outlined"
            fullWidth
            label="Search"
            onChange={(event) => AddNewFilter(new Searching(event.target.value))}/>
            </div>
            <div className="table">
        <table>
            <thead>
                <tr>
                    {headers.map((header) => {
                            if(header.filter !== undefined && header.filter == true)
                            {
                                return (<th key={header.id}>{header.labelName}<FilterAltIcon style={{float:"right"}} onClick={() => onClickFilterPopupOpen(header) } /></th>)
                            }
                            else if(header.ordering !== undefined && header.ordering == true)
                            {
                                const icon = header.order === "asc" ? "▲" : "▼";
                                return (<th onClick={() => AddNewFilter(new Sorting(header,header.order))} key={header.id}>{header.labelName}{icon}</th>)
                            }
                            else
                            {
                                return (<th key={header.id}>{header.labelName}</th>)
                            }
                            
                       
                        })}
                </tr>
            </thead>
            <tbody>
                {renderedData.map((row) => {
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