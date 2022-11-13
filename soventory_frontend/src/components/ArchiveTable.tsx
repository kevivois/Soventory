import React,{useState,useEffect} from "react"
import HeaderMode from "./Mode";
import TextField from "@mui/material/TextField";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import {Filtering,Searching,Sorting,Filter,HeaderType} from "./Filter.utils";
import Headers from "./headers"
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { DialogContent } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Checkbox from '@mui/material/Checkbox';
import EditOverlay from "./EditOverlay/EditOverlay";
import {FiFilter,FiPlus} from "react-icons/fi"
import "./style/Table.css";
import FilterOverlay from "./FilterOverlay";
import AddOverlay from "./AddOverlay/AddOverlay";
import Warning from "./WarningBar/WarningBar";
import DeleteIcon from '@mui/icons-material/Delete';
import DialogContentText from '@mui/material/DialogContentText';
export default function DataTable(props:{data:any[],materiels:any[],marques:any[],sections:any[],etats:any[],lieux:any[],user:any})
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
    const[rowToEdit,setRowToEdit] = useState<number | null>(null);
    const [searchBarValue,setSearchBarValue] = useState<string>("");
    const [openEditPopup,setOpenEditPopup] = useState<boolean>(false);
    const [divFilterOverlay,setDivFilterOverlay] = useState<React.LegacyRef<HTMLDivElement> | null>(null);
    const [readOnly,setReadOnly] = useState<boolean>(true);
    const [sortingFilter,setSortingFilter] = useState<Sorting>();
    const [openWarning,setOpenWarning] = useState(false);
    const [openAddPopup,setOpenAddPopup] = useState(false);
    const [error,setError] = useState<string>("");
    const [deleteWarning,setDeleteWarning] = useState(false);
    const [deleteId,setDeleteId] = useState<number | null>(null);
    const handleEditPageClose = () => {
        setOpenEditPopup(false)
        fetchDropDownList();
    };
    const handleAddPageClose = () => {
        fetchDropDownList();
        setOpenAddPopup(false)
    };

    const onApplyNewRow = async (newRow:any) => {
        try
        {
            var formatedRow = {garantie:newRow.garantie,archive:newRow.archive,date_achat:newRow.date_achat,fin_garantie:newRow.fin_garantie,prix:newRow.prix,remarque:newRow.remarque,id:newRow.id,section_FK:newRow.section,type_material_FK:newRow.materiel,etat_FK:newRow.etat,marque_FK:newRow.marque,lieu_FK:newRow.lieu,model:newRow.modele,num_serie:newRow.num_serie,num_produit:newRow.num_produit};
            const query = await fetch("http://localhost:3001/item/create",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(formatedRow)
            });
            const response = await query.json();
            console.log(response)
            if (response.error)
            {
                setError(response.error)
                setOpenWarning(true)
                setOpenAddPopup(false)
            }
            else
            {
                await refreshAll();
                setOpenAddPopup(false)
            }
        }
        catch (e:any)
        {
            setError(e.message)
            setOpenAddPopup(false)
        }
    }

    async function onDeleteRow(id:number | null){
        if(!id)return;
        
        try
        {
            const query = await fetch(`http://localhost:3001/item/${id}/delete`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
            });
            const response = await query.json();
            if (response.error)
            {
                setError(response.error)
            }
            else
            {
                await refreshAll();
            }
        }
        catch(e:any){
            setError(e.message)
        }

        setDeleteWarning(false)
    }

    async function refreshAll(){
        await fetchItems();
        await fetchDropDownList();
        var newF = [...filterList]
        setFilterList(newF);
    }

    const handleEditPageOpen = (event: React.MouseEvent<HTMLElement>,row:any) => {
        setRowToEdit(row.id);
        setOpenEditPopup(true);
    };

    useEffect(() => {
       setReadOnly(props.user.droit == "LIRE" ? true : false)
    }, [props.user])

    useEffect(() => {
        if(error == "")return;
        console.log(error)
        setOpenWarning(true);
    }, [error]);

    async function fetchItems()
        {
            try
            {
                console.log("fetching items archive")
                const query = await fetch("http://localhost:3001/item/archived/inner/all",{
                    credentials: "include"
                });
                const response = await query.json();
                setData(response);
                console.log("fetched data ",response)
            }
            catch(e:any){
                setError(e.message)
            }
        }

    function clearFilters(){
        setFilterList([]);
        setCheckBoxFilterList([]);
        setHeaders(Headers);
        setFilteredData(data);
        setRenderedData(data);
        setSearchBarValue("")

        if(sortingFilter !=undefined){
            setSortingFilter(new Sorting(sortingFilter.header,"asc"))
        }
    }
    useEffect(() => {
            if(filterList.filter((item:any) => item instanceof Filtering).length > 0)
            {
                ApplyFilteringFilter(filterList.filter((item:any) => item instanceof Filtering));
            }
            else
            {
                if(filterList.length == 0){
                    //fetchItems();
                }
                setFilteredData(data);
                
              
            }
            ApplySortingFilter(true);
    },[filterList])

    useEffect(() => {
        filterList.forEach((filter:Filter)=>{
            if(filter instanceof  Searching)
            {
             ApplySearchingFilter(filter);
            }
         })
         if(filterList.filter((item:any) => item instanceof Searching).length == 0)
         {
             setRenderedData(filteredData);
         }
        },[filteredData,filterList]);


        useEffect(() => {
            if(sortingFilter == null)return;
            ApplySortingFilter(true);
        },[sortingFilter]);


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
        var query = await fetch("http://localhost:3001/item/archived/byValues",{
            credentials: "include",
            method:"POST",
            headers: {
                'Content-Type': 'application/json'
              },
            body:JSON.stringify(body)
        })
        var newData = await query.json();
        setFilteredData(newData);
    }
    const ApplySortingFilter = (apply:boolean,data?:any[])=>
    {       
            var sortedData = []
            
            if(data == null){
                sortedData = [...renderedData];
            }else{
                sortedData = [...data];
            }
            if(sortingFilter == null) return sortedData;
            const filter = sortingFilter;
            const newHeaders = [...headers];
            newHeaders.forEach((h) => {
                if (h.key === filter.header.key) {
                    h.order = filter.order
                }
            });
            setHeaders(newHeaders);
            sortedData.sort((a, b) => {
                var aVal = (String(a[filter.header.key]).substring(2,5))
                var bVal = (String(b[filter.header.key]).substring(2,5))
                
                if (aVal < bVal) {
                    return filter.header.order === "asc" ? -1 : 1;
                }
                if (aVal > bVal) {
                    return filter.header.order === "asc" ? 1 : -1;
                }
                return 0;
            });

            if(apply){
                setRenderedData(sortedData)
                return sortedData
            }
            else{
                return sortedData
            }
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
        var newData = [...filteredData];
        newData = [];
        filteredData.forEach((dt) => {
          if (eachData(filter.value,dt)) {
            newData.push(dt);
          }
        });

        var sorted = ApplySortingFilter(false,newData);
        if(sorted != undefined){
            setRenderedData(sorted);
        } 
    }
    const AddNewFilter = (filter:Filter) => {
        var newFilterList = [...filterList];

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

      const onClickFilterPopupOpen = (event:any,header:any) => {
        let target = event.currentTarget as any;
        setDivFilterOverlay(target);
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
    const onRowClick = (event:any,row:any) => {
        // on each row right click
        // set entire row background color to #e0e0e0
        handleEditPageOpen(event,row);
        event.preventDefault();
    }

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

    const onApplyExistingRow = async (newRow:any,changed:boolean) => {

        if(!changed)return;
        var formatedRow = {garantie:newRow.garantie,archive:newRow.archive,date_achat:newRow.date_achat,fin_garantie:newRow.fin_garantie,prix:newRow.prix,remarque:newRow.remarque,id:newRow.id,section_FK:newRow.section,type_material_FK:newRow.materiel,etat_FK:newRow.etat,marque_FK:newRow.marque,lieu_FK:newRow.lieu,model:newRow.modele,num_serie:newRow.num_serie,num_produit:newRow.num_produit};
        
        const query = await fetch(`http://localhost:3001/item/${newRow.id}/update`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formatedRow),
        });
        const response = await query.json()
        if(response.error)
        {
            setError(String(response.error));

        }
        await refreshAll();
    }
    async function fetchDropDownList(){

        headers.forEach(async (header:any) => {

            if(!header.inner)return;
            const query = await fetch(`http://localhost:3001/item.${header.key}/all`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const response = await query.json()
            if(response.error)
            {
                setError(String(response.error));
            }
            else
            {
                if(header.key === "materiel")
                {
                    setMateriels(response);
                }
                else if(header.key === "marque")
                {
                    setMarques(response);
                }
                else if(header.key === "section")
                {
                    setSections(response);
                }
                else if(header.key === "etat")
                {
                    setEtats(response);
                }
                else if(header.key === "lieu")
                {
                    setLieux(response);
                }
            }
        });
    }

    return (
        <div className="App" style={{width:"100%",display:"flex",flexDirection:"column"}}>
            <div className="SearchDiv">
            <div className="SearchBar">
            <TextField sx={{width:"100%",float:"right"}}
            id="outlined-basic"
            variant="outlined"
            label="Search"
            value={searchBarValue}
            onChange={(event) => {
                var searchValue = String(event.target.value).trimStart();
                setSearchBarValue(searchValue);
                AddNewFilter(new Searching(searchValue))}}/></div>
            <div className="clearFiltersButton">
            <Button variant="outlined" onClick={() => {
               clearFilters();
            }}><FiFilter style={{marginRight:"5px"}}/>Clear filters</Button>
            <div>
            </div>
            </div>
            </div>
            <div className="table" style={{
            }}>
        <table>
            <thead>
                <tr className="columnContainer">
                    {headers.map((header) => {
                            if(header.show == false)return;
                            if(header.filter !== undefined && header.filter == true)
                            {
                                return (<th className="tableHeader" key={header.id}><div style={{display:"flex",flexDirection:"row",width:"100%",alignItems:"center"}}><div className="headerContent">{header.labelName}</div><FiFilter className="FilterIcon" onClick={(event) => onClickFilterPopupOpen(event,header) } /></div></th>)
                            }
                            else if(header.ordering !== undefined && header.ordering == true)
                            {
                                var order = "desc"
                                if(sortingFilter != null){
                                    order = sortingFilter.order == "asc" ? "desc" : "asc";
                                }
                                
                                const icon = order === "desc" ? "▼" : "▲";
                                return (<th className="tableHeader" onClick={() => setSortingFilter(new Sorting(header,order))} key={header.id}>{header.labelName}{icon}</th>)
                            }
                            else
                            {
                                return (<th className="tableHeader" key={header.id}>{header.labelName}</th>)
                            }
                        })}
                        <th id="deleteHeader"><DeleteIcon /></th>
                </tr>
            </thead>
            <tbody>
                {renderedData.length > 0 ?  renderedData.map((row) => {
                    return (
                        <tr  key={row.id} onMouseOver={(event) => {
                            // set color of the entire row when mouse over
                            const target = event.currentTarget as HTMLTableRowElement;
                            target.style.backgroundColor = "#e0e0e0";
                        }} onMouseOutCapture={(event) => {
                            const target = event.currentTarget as HTMLTableRowElement;
                            target.style.backgroundColor = "white";
                        }}>
                            {headers.map((header) => {
                                if(header.show == false)return;
                                let content = row[header.key];
                                return (<td className="tableContent"  key={header.id} onClick={(event) => onRowClick(event,row)} >{content}</td>)
                            })}
                            <td style={{textAlign:"center"}} ><Button id="deleteIconRow"  disabled={readOnly} onClick={() => {
                                setDeleteId(row.id);
                                setDeleteWarning(true);
                            }}><DeleteIcon /></Button></td>
                        </tr>
                    )
                }): <tr><td colSpan={headers.length} style={{textAlign:"center"}}>No data</td></tr>}
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
        
        <div className="editOverlay">
        {openEditPopup ? <EditOverlay canModify={!readOnly} open={openEditPopup} id={rowToEdit} deleteFunction={handleEditPageClose} headers={headers} onClose={handleEditPageClose} onApply={(newRow,changed) => onApplyExistingRow(newRow,changed)} /> : null}
            
        </div>
        <div className="warning-error">
            {openWarning ?   <Warning message={error} open={openWarning} onClose={() => setError("")} /> : null}
        </div>
        <div className="AddPopup">
            {openAddPopup ? <AddOverlay canModify={!readOnly} open={openAddPopup} headers={headers} onClose={handleAddPageClose} onApply={(newRow:any) => onApplyNewRow(newRow)} /> : null}
        </div>
        
        <div className="DeleteWarning">
            {deleteWarning ?  <Dialog open={deleteWarning} onClose={() => setDeleteWarning(false)} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Delete</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this row?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteWarning(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={() => {onDeleteRow(deleteId)}} color="primary">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog> : null}
        </div>
        </div>
    );
}