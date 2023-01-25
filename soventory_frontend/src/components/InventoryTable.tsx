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
import BottomBar from "./BottomBar/BottomBar";
import AddOverlay from "./AddOverlay/AddOverlay";
import Warning from "./WarningBar/WarningBar";
import getIp from "../IP";
import IEOverlay from "./ImportExportOverlay/IEOverlay";
import Pagination from "./Pagination/Pagination";
import {H_DetermineRowPerPage} from "./utils/data.utils";
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
    const [sortingFilter,setSortingFilter] = useState<Sorting>(new Sorting(Headers[0],"asc"));
    const [openWarning,setOpenWarning] = useState(false);
    const [openAddPopup,setOpenAddPopup] = useState(false);
    const [error,setError] = useState<string>("");
    const [openIEO,setOpenIEO] = useState(false);
    const [pageId,setPageId] = useState(1);
    const [paginateData,setPaginateData] = useState<any[]>([]);
    const [enablePagination,setEnablePagination] = useState(true);
    const [rowPerPage,setRowPerPage] = useState(0);
    const [maxPage,setMaxPage] = useState(Math.ceil(renderedData.length/rowPerPage));
    const [totalPrice,setTotalPrice] = useState<number |null>(null);
    let timer : ReturnType<typeof setTimeout> | null = null;
    
    const handleEditPageClose = () => {
        setOpenEditPopup(false)
        fetchDropDownList();
    };
    const handleAddPageClose = () => {
        fetchDropDownList();
        setOpenAddPopup(false)
    };
    const handlePagination = () => {
        if(!enablePagination){
            const paginateData = [...renderedData];
            return setPaginateData(paginateData);
        }
        const paginateData = renderedData.slice((pageId-1)*rowPerPage,pageId*rowPerPage);
        setPaginateData(paginateData);
        let mx = Math.ceil(renderedData.length / rowPerPage)
        if(mx <= 0) mx = 1;
        setMaxPage(mx);
        if(pageId > mx){
            setPageId(mx);
        }
    };
    function determineRowPerPage(){
        if(!enablePagination) return;
        try{
            let rowPP = H_DetermineRowPerPage(window.innerHeight);
            setRowPerPage(rowPP);
        }
        catch(e){
            console.log("error",e);
        }

    }
    const handlePageChange = (pageId:number) => {
        if(pageId > 0 && pageId <= maxPage){
            setPageId(pageId);
        }else if(pageId > maxPage){
            setPageId(maxPage);
        };
    };
    function handleResizing(){
        timer = setTimeout(()=> {
            determineRowPerPage();
            clearTimeout(timer as ReturnType<typeof setTimeout>);
        },1000);
    }
    useEffect(() => {
        handlePagination();
        determineTotalPrice();
    },[renderedData,pageId,enablePagination,rowPerPage]);
    useEffect(() => {
        determineRowPerPage()
        window.addEventListener("resize",handleResizing);
        return () => {
            window.removeEventListener("resize",handleResizing);
        }},[]);
    const onApplyNewRow = async (newRow:any) => {
        var errors = null
        try
        {
            var formatedRow = {garantie:newRow.garantie,archive:newRow.archive,date_achat:newRow.date_achat,fin_garantie:newRow.fin_garantie,prix:newRow.prix,remarque:newRow.remarque,id:newRow.id,section_FK:newRow.section,materiel_FK:newRow.materiel,etat_FK:newRow.etat,marque_FK:newRow.marque,lieu_FK:newRow.lieu,modele:newRow.modele,num_serie:newRow.num_serie,num_produit:newRow.num_produit};
            const query = await fetch("http://"+getIp()+":3001/item/create",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(formatedRow)
            });
            const response = await query.json();
            if (response.errors)
            {
                errors = response.errors
                setError(response.errors[0])
                setOpenWarning(true)
                
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
            setOpenWarning(true)
            if(errors){
                errors.push(e.message)
            }
           // setOpenAddPopup(false)
        }
        console.log(errors)
        return errors;
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
        
        if(props.user){
            if(props.user.droit == "LIRE"){
                setReadOnly(true);
            }
            else if (props.user.droit == "ECRIRE" || props.user.droit == "ADMINISTRATEUR"){
                setReadOnly(false);
            }
        }else{
            setReadOnly(true);
        }
    }, [props.user])

    useEffect(() => {
        if(error == "")return;
        setOpenWarning(true);
    }, [error]);

    async function fetchItems()
        {
            try
            {
                const query = await fetch("http://"+getIp()+":3001/item/inner/all",{
                    credentials: "include"
                });
                const response = await query.json();
                setData(response);
            }
            catch(e:any){
                setOpenWarning(true)
                setError(e.message)
            }
        }
    function determineTotalPrice(){
        var total = 0;
        renderedData.forEach((row:any) => {
            total += parseFloat(row.prix);
        });
        setTotalPrice(total);
    }
    function clearFilters(){
        setFilterList([]);
        setCheckBoxFilterList([]);
        setHeaders(Headers);
        setFilteredData(data);
        setRenderedData(data);
        setSearchBarValue("")
        setPageId(1);
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
             ApplySortingFilter(true,filteredData);
                
             if(filterList.filter((item:any) => item instanceof Filtering).length == 0)
             {
                 setEnablePagination(true);
             }else{
                setEnablePagination(false);
             }
         }else{
            setEnablePagination(false);
         }

        },[filteredData,filterList]);


    
    useEffect(() => {
        if(sortingFilter != undefined)
        {
            ApplySortingFilter(true);
        }
    },[sortingFilter])
    const ApplyFilteringFilter = async (filters:any[])=>
    {   
        var checkBoxFilter = checkBoxFilterList;
        var body = [...filters.map((filter:Filtering)=>{
            // name : value
            var selectedValues = filter.selectedValues.filter((item:any)=>item.checked == true);
            if(selectedValues.length == 0) {
                let newFilterList = [...filterList];
                newFilterList.splice(newFilterList.indexOf(filter),1);
                setFilterList(newFilterList);
                return
            }
            if(filter.header.inner)
            {
                return {name:`${filter.header.key}.nom`,values:selectedValues}
            }
            else
            {
                return {name:filter.header.key,values:selectedValues}
            }
        })].filter((item:any)=>item != null);
        var query = await fetch("http://"+getIp()+":3001/item/byValues",{
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
    const ApplySortingFilter = (apply:boolean,array?:any[])=>
    {       
            var sortedData = []
            
            if(array == null){
                sortedData = [...renderedData];
            }else{
                sortedData = [...array];
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

                if (a[filter.header.key] < b[filter.header.key]) {
                    return filter.header.order === "asc" ? -1 : 1;
                }
                if (a[filter.header.key] > b[filter.header.key]) {
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

        var sorted = ApplySortingFilter(true,newData);
    }
    const AddNewFilter = (filter:Filter) => {
        var newFilterList = [...filterList];

        if(filter instanceof Searching)
        {
            //check if there is a filtering filter with the same header
            var index = newFilterList.findIndex((flt:Filter)=>flt instanceof Searching);
            if(filter.value == ""){
                
                if(index !== -1)
                {
                    newFilterList.splice(index,1);
                }
            }else{
                if(index !== -1)
                {
                    newFilterList[index] = filter;
                }
                else
                {
                    newFilterList.push(filter);
                }
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
        if(newFilter.selectedValues.length === 0){
            return setOpenPopup(false);
        }
        if(index !== -1)
        {

            newFilterList[index].selectedValues.forEach((item:any) => {
                var index2 = newFilter.selectedValues.findIndex((item2:any) => item2.nom === item.nom);
                if(index2 === -1)
                {
                    newFilter.selectedValues.push(item);
                }
            });
            if(newFilter.selectedValues.find((item:any) => item.checked === true) === undefined ){
                console.log(newFilterList)
                newFilterList.splice(index,1);
                console.log(newFilterList)
            }else{
                newFilterList[index] = newFilter;
            }
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
        var formatedRow = {garantie:newRow.garantie,archive:newRow.archive,date_achat:newRow.date_achat,fin_garantie:newRow.fin_garantie,prix:newRow.prix,remarque:newRow.remarque,id:newRow.id,section_FK:newRow.section,materiel_FK:newRow.materiel,etat_FK:newRow.etat,marque_FK:newRow.marque,lieu_FK:newRow.lieu,modele:newRow.modele,num_serie:newRow.num_serie,num_produit:newRow.num_produit};
        
        const query = await fetch(`http://${getIp()}:3001/item/${newRow.id}/update`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formatedRow),
        });
        const response = await query.json()
        if(response.errors)
        {
            return response.errors;
        }
        await refreshAll();
    }
    async function fetchDropDownList(){
        try
        {
            const query = await fetch("http://"+getIp()+":3001/item/FK/all",{
                credentials: "include"
            });
            const response = await query.json();
            let categories = response.find((element:any) => element.key == "materiel") ? response.find((element:any) => element.key == "materiel").values : [];
            let marques = response.find((element:any) => element.key == "marque") ? response.find((element:any) => element.key == "marque").values : [];
            let etats = response.find((element:any) => element.key == "etat") ? response.find((element:any) => element.key == "etat").values : [];
            let lieux = response.find((element:any) => element.key == "lieu") ? response.find((element:any) => element.key == "lieu").values : [];
            let sections = response.find((element:any) => element.key == "section") ? response.find((element:any) => element.key == "section").values : [];
            setMateriels(categories);
            setMarques(marques);
            setEtats(etats);
            setLieux(lieux);
            setSections(sections);
            
        }
        catch (error)
        {
            console.log(error)
        }
    }
    const onImportCsv = async (array:any) => {
        const query = await fetch(`http://${getIp()}:3001/item/import`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({items:array}),
        });
        const response = await query.json()
        if(response.error)
        {
            setError(String(response.error));
        }
        else
        {
            await refreshAll();
        }
    }

    return (
        <div className="App" style={{width:"100%",display:"flex",flexDirection:"column"}}>
            <div className="SearchDiv">
            <div className="SearchBar">
            <TextField sx={{width:"100%",float:"right"}}
            id="outlined-basic"
            variant="outlined"
            label="Rechercher"
            value={searchBarValue}
            onChange={(event) => {
                var searchValue = String(event.target.value).trimStart();
                setSearchBarValue(searchValue);
                AddNewFilter(new Searching(searchValue))}}/></div>
            <div className="clearFiltersButton">
            <Button style={{color:"#550055",borderColor:"#550055"}} variant="outlined" onClick={() => {
               clearFilters();
            }}><FiFilter style={{marginRight:"5px"}}/>Effacer les filtres</Button>
            <div>
            </div>
            </div>
            </div>
            <div className="InventoryTable">
        <table>
            <thead>
                <tr className="columnContainer">
                    {headers.map((header) => {
                            if(header.show == false)return;
                            if(header.filter !== undefined && header.filter == true)
                            {
                                return (<th className="tableHeader" key={header.id}><div style={{display:"flex",flexDirection:"row",width:"100px"}}><div className="headerContent">{header.labelName}</div><FiFilter className="FilterIcon" style={{width:"100%"}} onClick={(event) => onClickFilterPopupOpen(event,header) } /></div></th>)
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
                </tr>
            </thead>
            <tbody>
                {paginateData.length > 0 ? paginateData.map((row) => {
                    return (
                        <tr key={row.id} onMouseOver={(event) => {
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
                                if(header.key == "prix"){
                                    // format to price with swiss currency 
                                    content =   new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(content);
                                }
                                return (<td className="tableContent" style={header.inner ? {textAlign:"left"}:{textAlign:"center"}}  key={header.id} onClick={(event) => onRowClick(event,row)} >{content}</td>)
                            })}
                        </tr>
                    )
                        })
                
                : <tr><td colSpan={headers.length} style={{textAlign:"center"}}>Pas de données</td></tr>}
             </tbody>
            </table>
            <div style={totalPrice != null ? {borderTop:"1px solid black"} : {display:"none"}}>
            <div style={{display:"table",width:"100%"}}>
            <div style={{display:"table-cell",width:"6%",float:"right",marginRight:"35px"}}>{new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(totalPrice || 0)}</div>
            </div>
            </div>
            <BottomBar onOpenIEO={() => setOpenIEO(true)} enablePagination={enablePagination} handlePageChange={handlePageChange} maxPage={maxPage} pageId={pageId} readOnly={readOnly}  setOpenIEO={(open:boolean) => setOpenIEO(open)} setOpenAddPopup={(open:boolean) => setOpenAddPopup(open)} setEnablePagination={() => setEnablePagination(!enablePagination)}   />
            </div>
            <div className="FilterPopup">
            <Dialog
            
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435}}}
      maxWidth="xs"
      open={openPopup}
    >
      <DialogTitle>Filtres</DialogTitle>
      <DialogContent dividers style={{overflow:"auto"}}>
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
        {openEditPopup ? <EditOverlay canModify={!readOnly} open={openEditPopup} id={rowToEdit} deleteFunction={handleEditPageClose} headers={headers} onClose={handleEditPageClose} onApply={onApplyExistingRow} /> : null}
            
        </div>
        <div className="AddPopup">
            {openAddPopup ? <AddOverlay canModify={!readOnly} open={openAddPopup} headers={headers} onClose={handleAddPageClose} onApply={onApplyNewRow} /> : null}
        </div>
        <div className="IEOverlay">
            {openIEO ? <IEOverlay enable={!readOnly} exportArray={renderedData} open={openIEO} onImport={onImportCsv} onClose={() => setOpenIEO(false)} /> : null}
        </div>
        <div className="warning-error">
            {openWarning && error &&  <Warning message={error} open={true} onClose={() => {
                setOpenWarning(false)
                }} />}
            </div>
        </div>
    );
}