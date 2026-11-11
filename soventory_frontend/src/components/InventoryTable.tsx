import React,{useMemo,useState,useEffect} from "react"
import HeaderMode from "./Mode";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import {Filtering,Sorting,HeaderType} from "./Filter.utils";
import Headers from "./headers"
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { DialogContent } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Checkbox from '@mui/material/Checkbox';
import EditOverlay from "./EditOverlay/EditOverlay";
import {FiFilter} from "react-icons/fi"
import "./style/Table.css";
import BottomBar from "./BottomBar/BottomBar";
import AddOverlay from "./AddOverlay/AddOverlay";
import Warning from "./WarningBar/WarningBar";
import getIp from "../IP";
import IEOverlay from "./ImportExportOverlay/IEOverlay";
import Pagination from "./Pagination/Pagination";
import {H_DetermineRowPerPage} from "./utils/data.utils";
import { importItems } from "./utils/import.utils";
import { filterAndSortRows } from "./utils/tableData.utils";
export default function DataTable(props:{data:any[],materiels:any[],marques:any[],sections:any[],etats:any[],lieux:any[],user:any})
{
    const [data, setData] = useState<any[]>(props.data);
    const headers = Headers;
    const [filterList,setFilterList] = useState<any[]>([]);
    const [openPopup,setOpenPopup] = useState<boolean>(false);
    const [headerFiltering,setHeaderFiltering] = useState<HeaderType>(Headers[0]);
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
    const [readOnly,setReadOnly] = useState<boolean>(true);
    const [sortingFilter,setSortingFilter] = useState<Sorting>(new Sorting(Headers[0],"asc"));
    const [openWarning,setOpenWarning] = useState(false);
    const [openAddPopup,setOpenAddPopup] = useState(false);
    const [error,setError] = useState<string>("");
    const [openIEO,setOpenIEO] = useState(false);
    const [pageId,setPageId] = useState(1);
    const [enablePagination,setEnablePagination] = useState(true);
    const [rowPerPage,setRowPerPage] = useState(23);
    const activeFilters = useMemo(
        () => filterList.filter((item:any) => item instanceof Filtering) as Filtering[],
        [filterList]
    );
    const renderedData = useMemo(
        () => filterAndSortRows(data, activeFilters, searchBarValue, sortingFilter),
        [data, activeFilters, searchBarValue, sortingFilter]
    );
    const maxPage = Math.max(1, Math.ceil(renderedData.length / Math.max(1, rowPerPage)));
    const paginateData = useMemo(
        () => enablePagination
            ? renderedData.slice((pageId - 1) * rowPerPage, pageId * rowPerPage)
            : renderedData,
        [renderedData, enablePagination, pageId, rowPerPage]
    );
    const totalPrice = useMemo(
        () => renderedData.reduce((total, row) => {
            const price = Number.parseFloat(row.prix);
            return total + (Number.isFinite(price) ? price : 0);
        }, 0),
        [renderedData]
    );
    
    const handleEditPageClose = () => {
        setOpenEditPopup(false)
        fetchDropDownList();
    };
    const handleAddPageClose = () => {
        fetchDropDownList();
        setOpenAddPopup(false)
    };
    useEffect(() => {
        if (pageId > maxPage) setPageId(maxPage);
    }, [pageId, maxPage]);
    const handlePageChange = (pageId:number) => {
        if(pageId > 0 && pageId <= maxPage){
            setPageId(pageId);
        }else if(pageId > maxPage){
            setPageId(maxPage);
        };
    };
    useEffect(() => {
        if (!enablePagination) return;
        const determineRowPerPage = () => {
            try{
                setRowPerPage(H_DetermineRowPerPage(window.innerHeight));
            }
            catch(e){
                console.log("error",e);
            }
        };
        let timer: ReturnType<typeof setTimeout>;
        const handleResizing = () => {
            clearTimeout(timer);
            timer = setTimeout(determineRowPerPage, 150);
        };
        determineRowPerPage();
        window.addEventListener("resize",handleResizing);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize",handleResizing);
        };
    },[enablePagination]);
    const onApplyNewRow = async (newRow:any) => {
        var errors = null
        try
        {
            var formatedRow = {garantie:newRow.garantie,archive:newRow.archive,date_achat:newRow.date_achat,fin_garantie:newRow.fin_garantie,prix:newRow.prix,remarque:newRow.remarque,id:newRow.id,section_FK:newRow.section,materiel_FK:newRow.materiel,etat_FK:newRow.etat,marque_FK:newRow.marque,lieu_FK:newRow.lieu,modele:newRow.modele,num_serie:newRow.num_serie,num_produit:newRow.num_produit};
            const query = await fetch(getIp()+"/item/create",{
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
                const query = await fetch(getIp()+"/item/inner/all",{
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
    function clearFilters(){
        setFilterList([]);
        setCheckBoxFilterList([]);
        setSearchBarValue("")
        setPageId(1);
        setSortingFilter(new Sorting(Headers[0],"asc"));
    }

      const onClickFilterPopupOpen = (header:HeaderType) => {
          const optionsByKey: Record<string, any[]> = {
              materiel: materiels,
              marque: marques,
              section: sections,
              etat: etats,
              lieu: lieux,
          };
          const options = optionsByKey[header.key] || [];
          const currentFilter = activeFilters.find((filter) => filter.header.key === header.key);
          setFilterDataList(options);
          setCheckBoxFilterList(options.map((option) => ({
              ...option,
              checked: currentFilter?.selectedValues.some((selected) => selected.nom === option.nom && selected.checked) || false,
          })));
          setHeaderFiltering(header);
          setOpenPopup(true);
        };
      
        const addNewCheckBoxToCheckBoxList = (dt:any,event:any) => {
          setCheckBoxFilterList((current) => current.map((option) =>
              option.nom === dt.nom ? {...option, checked:event.target.checked} : option
          ));
    };
    const onRowClick = (event:any,row:any) => {
        // on each row right click
        // set entire row background color to #e0e0e0
        handleEditPageOpen(event,row);
        event.preventDefault();
    }

    const addCheckBoxFilter = () => {
        const remainingFilters = filterList.filter(
            (filter:any) => !(filter instanceof Filtering && filter.header.key === headerFiltering.key)
        );
        const selectedValues = checkBoxFilterList.filter((option) => option.checked);
        if (selectedValues.length > 0) {
            remainingFilters.push(new Filtering(headerFiltering, selectedValues));
        }
        setFilterList(remainingFilters);
        setPageId(1);
        setOpenPopup(false);
    }

    const onApplyExistingRow = async (newRow:any,changed:boolean) => {

        if(!changed)return;
        var formatedRow = {garantie:newRow.garantie,archive:newRow.archive,date_achat:newRow.date_achat,fin_garantie:newRow.fin_garantie,prix:newRow.prix,remarque:newRow.remarque,id:newRow.id,section_FK:newRow.section,materiel_FK:newRow.materiel,etat_FK:newRow.etat,marque_FK:newRow.marque,lieu_FK:newRow.lieu,modele:newRow.modele,num_serie:newRow.num_serie,num_produit:newRow.num_produit};
        
        const query = await fetch(`${getIp()}/item/${newRow.id}/update`, {
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
            const query = await fetch(getIp()+"/item/FK/all",{
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
        const summary = await importItems(array);
        setError(summary);
        await refreshAll();
    }

    return (
        <div className="App" style={{width:"100%",display:"flex",flexDirection:"column"}}>
            <div className="SearchDiv">
            <div className="SearchBar">
            <TextField sx={{width:"100%",float:"right"}}
            id="outlined-basic"
            variant="outlined"
            label="Rechercher"
            inputProps={{"aria-label":"Rechercher un équipement"}}
            InputProps={{startAdornment:<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>}}
            value={searchBarValue}
            onChange={(event) => {
                setSearchBarValue(event.target.value);
                setPageId(1);
            }}/></div>
            <div className="clearFiltersButton">
            <Button aria-label="Effacer la recherche et les filtres" style={{color:"#550055",borderColor:"#550055"}} variant="outlined" onClick={clearFilters}>
                <FiFilter style={{marginRight:"5px"}}/>
                {searchBarValue || activeFilters.length ? `Effacer (${activeFilters.length + (searchBarValue ? 1 : 0)})` : "Effacer les filtres"}
            </Button>
            <div>
            </div>
            </div>
            </div>
            {activeFilters.length > 0 && (
                <div className="active-filters" aria-label="Filtres actifs">
                    {activeFilters.map((filter) => (
                        <button
                            type="button"
                            className="active-filter-chip"
                            key={filter.header.key}
                            aria-label={`Retirer le filtre ${filter.header.labelName}`}
                            onClick={() => {
                                setFilterList((current) => current.filter(
                                    (item:any) => !(item instanceof Filtering && item.header.key === filter.header.key)
                                ));
                                setPageId(1);
                            }}
                        >
                            {filter.header.labelName}<span>{filter.selectedValues.filter((value) => value.checked).length}</span><b aria-hidden="true">×</b>
                        </button>
                    ))}
                    <span className="result-count">{renderedData.length} résultat{renderedData.length === 1 ? "" : "s"}</span>
                </div>
            )}
            <div className="InventoryTable">
        <table>
            <thead>
                <tr className="columnContainer">
                    {headers.map((header) => {
                            if(header.show == false)return;
                            let radiusTopLeft = 0;
                            let radiusTopRight = 0;
                            if(headers.indexOf(header) === 0){
                                radiusTopLeft = 15;

                            }
                            if(headers.indexOf(header) === headers.length - 2){
                                radiusTopRight = 15;
                            }
                            if(header.filter !== undefined && header.filter == true)
                            {
                                
                                const isFiltered = activeFilters.some((filter) => filter.header.key === header.key);
                                return (<th className="tableHeader" key={header.id}><div className="filterable-header"><span>{header.labelName}</span><button type="button" className={`table-filter-button${isFiltered ? " is-active" : ""}`} aria-label={`Filtrer par ${header.labelName}`} aria-pressed={isFiltered} onClick={() => onClickFilterPopupOpen(header)}><FiFilter /></button></div></th>)
                            }
                            else if(header.ordering !== undefined && header.ordering == true)
                            {
                                const isSorted = sortingFilter.header.key === header.key;
                                const order = isSorted && sortingFilter.order === "asc" ? "desc" : "asc";
                                const icon = isSorted ? sortingFilter.order === "asc" ? "↑" : "↓" : "";
                                return (<th className="tableHeader" key={header.id}><button type="button" className="table-sort-button" aria-label={`Trier par ${header.labelName}${isSorted ? sortingFilter.order === "asc" ? ", croissant" : ", décroissant" : ""}`} onClick={() => {setSortingFilter(new Sorting(header,order)); setPageId(1);}}>{header.labelName}<span>{icon}</span></button></th>)
                            }
                            else
                            {
                                return (<th className="tableHeader" style={{borderTopLeftRadius:`${radiusTopLeft}px`,borderTopRightRadius:`${radiusTopRight}px`}} key={header.id}>{header.labelName}</th>)
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
              control={<Checkbox color="primary" checked={checkBoxFilterList.find((option) => option.nom === dt.nom)?.checked || false} onChange={(event) => addNewCheckBoxToCheckBoxList(dt,event)} />}
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
            {openIEO ? <IEOverlay exportheaders={headers} enable={!readOnly} exportArray={renderedData} open={openIEO} onImport={onImportCsv} onClose={() => setOpenIEO(false)} /> : null}
        </div>
        <div className="warning-error">
            {openWarning && error &&  <Warning message={error} open={true} onClose={() => {
                setOpenWarning(false)
                }} />}
            </div>
        </div>
    );
}