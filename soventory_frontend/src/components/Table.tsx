import React,{useState,useEffect, useCallback} from "react"
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
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import ReactSelect from "react-select";
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
    const [modifyingCase,setModifyingCase] = useState<{id:any,headerName:any,value:any}>({id:-1,headerName:"",value:""});
    const [headerModfiying,setHeaderModfiying] = useState<HeaderType>(headers[0]);


    useEffect(() => {
        var idx = 0;
        filterList.forEach((filter:Filter)=>{
           if(filter instanceof  Filtering)
           {
            ApplyFilteringFilter(idx,filter);
            idx++;
           }
        })
        setRemovingFirst(true);
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

    useEffect(() => {

    },[modifyingCase])

    useEffect(() => {
        getFilterDataList(headerModfiying);
    },[headerModfiying])


    const ApplyFilteringFilter = (id:number,filter:Filtering)=>
    {
        var dataToFilter = [...filteredData];
        var selectedValues = filter.selectedValues;
        let header = filter.header;
        let newData : any[] = []
        if(id == 0 ) {
            dataToFilter = [...data]
        };
        if(selectedValues.length > 0)
        {
            dataToFilter.forEach((row:any)=>{
                var adding = false
                selectedValues.forEach((value:any)=>{
                    if(row[header.key] == value.nom)
                    {
                        adding = true
                    }
                })
                if (adding) {
                    newData.push(row)
                }
            });
        }
        else if(id == 0)
        {
            
            newData = [...data]
        }
    //    console.log(newData,id,selectedValues)
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
      const getFilterDataList = (header:any) => {
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
      }
      const onClickFilterPopupOpen = (header:any) => {
        getFilterDataList(header)
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
        
        newFilter.selectedValues.forEach((value:any)=>{
           if(!value.checked)
           {
            var idx = newFilterList[index].selectedValues.findIndex((item:any) => item.nom === value.nom);
            newFilterList[index].selectedValues.splice(idx,1);
           }
        })

        if(index !== -1)
        {
            newFilterList[index].selectedValues =  newFilterList[index].selectedValues.filter((item:any) => item.checked === true);
            newFilter.selectedValues = newFilter.selectedValues.filter((item:any) => item.checked === true);
            var v = newFilterList[index].selectedValues
            newFilter.selectedValues.push(...v)
            newFilterList[index] = newFilter;
            console.log(newFilterList)
        }
        else
        {
            newFilterList.push(newFilter);
        }

        setFilterList(newFilterList);
        setOpenPopup(false)
    }


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
                                if(modifyingCase.id === row.id && modifyingCase.headerName === header.key)
                                {
                                    if(header.canEdit)
                                    {
                                        return (<td key={header.id}><TextField style={{width:"100%"}} value={row[header.key]} onChange={(event) => setModifyingCase({...modifyingCase,value:event.target.value})} /></td>)
                                    }
                                    else if(header.isDropDownList)
                                    {
                                        var v = Object.keys(props).find((key) => key === header.key);
                                       
                                            // show a drop down list of current header list values without call the re-render error
                                    }
                                }
                                else
                                {
                                    return (<td key={header.id} onClick={() => {
                                        setModifyingCase({id:row.id,headerName:header.key,value:row[header.key]})
                                    }}>{row[header.key]}</td>)
                                }
                                return (<td key={header.id}>{row[header.key]}</td>)
                            })}
                        </tr>
                    )
                })}
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

                            if(v.nom === dt.nom )
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