import React,{useState,useEffect} from "react"
import HeaderMode from "./Mode";
import TextField from "@mui/material/TextField";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import {Filtering,Searching,Sorting,Filter,HeaderType} from "./Filter.utils";
import Headers from "./headers"
import "./style/TableStyle.css"
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { DialogContent } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Checkbox from '@mui/material/Checkbox';
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import "./style/Table.css";
export default function DataTable(props:{data:any[],materiels:any[],marques:any[],sections:any[],etats:any[],lieux:any[]})
{
    const [data, setData] = useState<any[]>(props.data);
    const [headers,setHeaders] = useState<typeof Headers>(Headers)
    const [filteredData,setFilteredData] = useState<any[]>(data);
    const [renderedData,setRenderedData] = useState<any[]>(data);
    const [filterList,setFilterList] = useState<any[]>([]);
    const [openPopup,setOpenPopup] = useState<boolean>(false);
    const [headerFiltering,setHeaderFiltering] = useState<HeaderType>(headers[0]);
    const [materiels,setMateriels] = useState<any[]>(props.materiels);
    const [marques,setMarques] = useState<any[]>(props.marques);
    const [sections,setSections] = useState<any[]>(props.sections);
    const [etats,setEtats] = useState<any[]>(props.etats);
    const [lieux,setLieux] = useState<any[]>(props.lieux);
    const [filterDataList,setFilterDataList] = useState<any[]>([]);
    const [checkBoxFilterList,setCheckBoxFilterList] = useState<any[]>([]);
    const [removingFirst,setRemovingFirst] = useState<boolean>(true);


    useEffect(() => {
        
            if(filterList.filter((item:any) => item instanceof Filtering).length > 0)
            {
                ApplyFilteringFilter(filterList.filter((item:any) => item instanceof Filtering));
            }
            
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

    },[filterList])


    const ApplyFilteringFilter = async (filters:any[])=>
    {
        var checkBoxFilter = checkBoxFilterList;
        var body = [...filters.map((filter:Filtering)=>{
            // name : value
            var selectedValues = filter.selectedValues.filter((item:any)=>item.checked == true);
            if(selectedValues.length == 0) {return null}
            if(filter.header.inner)
            {
                return {name:`${filter.header.key}.nom`,values:selectedValues}
            }
            else
            {
                return {name:filter.header.key,values:selectedValues}
            }
        })].filter((item:any)=>item != null);
        var query = await fetch("http://localhost:3001/item/byValues",{
            credentials: "include",
            method:"POST",
            headers: {
                'Content-Type': 'application/json'
              },
            body:JSON.stringify(body)
        })
        var newData = await query.json();
        setFilteredData(newData);
        setRenderedData(newData);
    }
    const ApplySortingFilter = (filter:Sorting)=>
    {
            const newHeaders = [...headers];
            newHeaders.forEach((h) => {
                if (h.key === filter.header.key) {
                    h.order = h.order === "asc" ? "desc" : "asc";
                }
            });
            setHeaders(newHeaders);
            const newFilteredData = [...filteredData];
            const rdtData = [...renderedData];
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
              var index = newFilterList.findIndex((flt:Filter)=> flt instanceof Filtering && flt.header === filter.header);
              
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
        if(header.key === "materiel")
        {
            setFilterDataList(materiels);
        }
        else if(header.key === "marque")
        {
            setFilterDataList(marques);
        }
        else if(header.key === "section")
        {
            setFilterDataList(sections);
        }
        else if(header.key === "etat")
        {
            setFilterDataList(etats);
        }
        else if(header.key === "lieu")
        {
            setFilterDataList(lieux);
        }
        setHeaderFiltering(header);
        setOpenPopup(true)
      };

      const addNewCheckBoxToCheckBoxList = (dt:any,event:any) => {
        var newCheckBoxFilterList = [...checkBoxFilterList];
        // check if checkbox exist in list
        var index = newCheckBoxFilterList.findIndex((item:any) => item.nom === dt.nom);
            // if exist and true do nothing
           
        // if exist replace it with new one if not add it
        var row = {...dt,checked:event.target.checked}
        if (index !== -1) {
          newCheckBoxFilterList[index] = row;
        } else {
          newCheckBoxFilterList.push(row);
        }
        setCheckBoxFilterList(newCheckBoxFilterList);
        
    };

    const addCheckBoxFilter = () => {
        var newFilterList = [...filterList];
        var newFilter = new Filtering(headerFiltering, checkBoxFilterList);
        setCheckBoxFilterList([])
        var index = newFilterList.findIndex((item:any) => item instanceof Filtering &&  item.header.key === headerFiltering.key);
        
        if(index !== -1)
        {

            newFilterList[index].selectedValues.forEach((item:any) => {
                var index2 = newFilter.selectedValues.findIndex((item2:any) => item2.nom === item.nom);
                if(index2 === -1)
                {
                    newFilter.selectedValues.push(item);
                }
            });
            newFilterList[index] = newFilter;
        }
        else
        {
            newFilterList.push(newFilter);
        }
        setFilterList(newFilterList);
        setOpenPopup(false)
    }


    return (
        <div className="App" style={{display:"inline-block",width:"100%"}}>
            <div className="SearchBar">
            <TextField style={{width:"100%",float:"left"}}
            id="outlined-basic"
            variant="outlined"
            label="Search"
            onChange={(event) => AddNewFilter(new Searching(event.target.value))}/>
            </div>
            <div className="table" style={{
            }}>
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
                {renderedData.length > 0 ?  renderedData.map((row) => {
                    return (
                        <tr key={row.id}>
                            {headers.map((header) => {
                                return (<td  key={header.id}>{row[header.key]}</td>)
                            })}
                        </tr>
                    )
                }): <a href="#" onClick={() => {
                    setFilterList([]);
                    setCheckBoxFilterList([]);
                    setRenderedData(data);
                    setFilteredData(data);
                }} style={{textAlign:"center"}}>No Data, clear filters</a>}
             </tbody>
            </table>
            </div>
            <div className="FilterPopup">
            <Dialog
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
      open={openPopup}
    >
      <DialogTitle>Filters</DialogTitle>
      <DialogContent dividers>
          {filterDataList.map((dt) => {
                var checked = false
                filterList.forEach((flt) => {
                    if(flt instanceof Filtering && flt.header.key === headerFiltering.key)
                    {
                        flt.selectedValues.forEach((v) => {
                            if(v.nom === dt.nom && v.checked == true)
                            {
                                checked = true
                            }
                        })
                    }
                })
                return (
                <div key={dt.id}>
            <FormControlLabel
              value={dt.nom}
              key={dt.id}
              control={<Checkbox color="primary" defaultChecked={checked} onChange={(event) => addNewCheckBoxToCheckBoxList(dt,event)} />}
              label={dt.nom}
            />
            </div>
                )
        })}
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={() => {addCheckBoxFilter()}}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
        </div>
        </div>
    );
}