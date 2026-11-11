import React from "react";
import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarHeader,
  SidebarFooter,
  SidebarContent
} from "react-pro-sidebar";
import {
  BiLogOut
} from "react-icons/bi";
import { IconType } from "react-icons/lib";
import { useLocation } from "react-router-dom";
const Aside = (props:{ onIconClick:()=> void,image:any, collapsed:any, rtl:any, toggled:any,title:string,options:{id:number,key:string,labelName:string,icon:IconType,onClickMenuitem:(which: number) => void,active:boolean}[],disconnectFunction:() => Promise<void>,menuIcon:string}) => {
  const location = useLocation();
  return (
    <ProSidebar
    style={{height:"100vh",width:"100%"}}
      rtl={props.rtl}
      collapsed={props.collapsed}
      toggled={props.toggled}
      onToggle={undefined}
    >
      <SidebarHeader>
        <div
          className="sidebar-brand"
        >
          <button type="button" className="sidebar-mark" aria-label="Aller au tableau de bord" onClick={props.onIconClick}>
            <img className="brand-mascot" src={props.menuIcon} alt="" />
          </button>
          <div className="sidebar-brand-copy">
            <strong>{props.title}</strong>
            <span>GESTION DE PARC</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Menu iconShape="circle">
          {props.options.map((option) => {
            if(!option.active) return
            return (
              <MenuItem
                key={option.key}
                className={location.pathname === `/${option.key}` ? "menu-item-active" : ""}
                icon={<option.icon />}
                onClick={() => {
                    option.onClickMenuitem(option.id);
                }}
              >
                {option.labelName}
              </MenuItem>
            );
          })}
        </Menu>
      </SidebarContent>
      <SidebarFooter>
      <Menu iconShape="circle">
          <MenuItem icon={<BiLogOut />} onClick={props.disconnectFunction}>
            Déconnexion
          </MenuItem>
        </Menu>
      </SidebarFooter>
    </ProSidebar>
  );
};
export default Aside;
