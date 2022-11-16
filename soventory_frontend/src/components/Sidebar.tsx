import React, { useEffect } from "react";
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
  FaTachometerAlt,
  FaGem,
  FaList,
  FaGithub,
  FaRegLaughWink,
  FaHeart,
} from "react-icons/fa";
import {
  BiLogOut
} from "react-icons/bi";
import { IconType } from "react-icons/lib";
import { Link } from "react-router-dom";
const Aside = (props:{ image:any, collapsed:any, rtl:any, toggled:any,title:string,options:{id:number,key:string,labelName:string,icon:IconType,onClickMenuitem:(which: number) => void}[],disconnectFunction:() => Promise<void>,menuIcon:string}) => {
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
          style={{
            padding: "24px",
            textTransform: "uppercase",
            fontWeight: "bold",
            fontSize: 14,
            letterSpacing: "1px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center",
            display:"inline-flex",
            flexDirection:"row",
          }}
        >
          <div><img src={props.menuIcon} style={{width:"50px",height:"50px",marginLeft:"10px"}}/></div> <div style={{margin:"auto",marginLeft:"10px"}}>{props.title}</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Menu iconShape="circle">
          {props.options.map((option) => {
            return (
              <MenuItem
                key={option.key}
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
