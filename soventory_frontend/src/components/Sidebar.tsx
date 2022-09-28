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
  FaTachometerAlt,
  FaGem,
  FaList,
  FaGithub,
  FaRegLaughWink,
  FaHeart
} from "react-icons/fa";

const Aside = (props:{ image:any, collapsed:any, rtl:any, toggled:any, handleToggleSidebar:any }) => {
  return (
    <ProSidebar
    style={{height:"100vh"}}
      rtl={props.rtl}
      collapsed={props.collapsed}
      toggled={props.toggled}
      breakPoint="md"
      onToggle={props.handleToggleSidebar}
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
            whiteSpace: "nowrap"
          }}
        >
          'sidebarTitle'
        </div>
      </SidebarHeader>

      <SidebarContent>
        <Menu iconShape="circle">
          <MenuItem
            icon={<FaTachometerAlt />}
            suffix={<span className="badge red">'new'</span>}
          >
           Dashboard
          </MenuItem>
          <MenuItem icon={<FaGem />}> Account</MenuItem>
          <MenuItem icon={<FaGem />}> Parameters</MenuItem>
          <MenuItem icon={<FaGem />}> Feedback</MenuItem>
        </Menu>
      </SidebarContent>
    </ProSidebar>
  );
};
export default Aside;
