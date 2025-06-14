/* eslint-disable react/prop-types */
/*!
  =========================================================
  * Muse Ant Design Dashboard - v1.0.0
  =========================================================
  * Product Page: https://www.creative-tim.com/product/muse-ant-design-dashboard
  * Copyright 2021 Creative Tim (https://www.creative-tim.com)
  * Licensed under MIT (https://github.com/creativetimofficial/muse-ant-design-dashboard/blob/main/LICENSE.md)
  * Coded by Creative Tim
  =========================================================
  * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { Menu } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FileImageOutlined, PlayCircleOutlined, PieChartOutlined } from "@ant-design/icons";

function Sidenav({ color }) {
  const { pathname } = useLocation();
  const page = pathname.replace("/", "");

  const [selectedKey, setSelectedKey] = useState("dashboard");

  useEffect(() => {
    setSelectedKey(page);
  }, [page]);

  const dashboard = [
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      key={0}
    >
      <path
        d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V6.58579C17 6.851 16.8946 7.10536 16.7071 7.29289L11.2929 12.7071C11.1054 12.8946 11 13.149 11 13.4142V16C11 16.5523 10.5523 17 10 17H6C5.44772 17 5 16.5523 5 16V13.4142C5 13.149 4.89464 12.8946 4.70711 12.7071L0.292893 8.29289C0.105357 8.10536 0 7.851 0 7.58579V4C0 3.44772 0.447715 3 1 3H3Z"
        fill={color}
      ></path>
    </svg>,
  ];

  const menuItems = [
    {
      key: "/playlist-view",
      label: (
        <NavLink to="/playlist-view">
          <span
            className="icon"
            style={{
              backgroundColor: selectedKey === "playlist-view" ? "#f0f2f5" : "",
            }}
          >
            <PlayCircleOutlined />
          </span>
          <span className="label">Galeri Playlist</span>
        </NavLink>
      ),
    },
 
    {
      key: "/playlist",
      label: (
        <NavLink to="/playlist">
          <span
            className="icon"
            style={{
              backgroundColor: selectedKey === "playlist" ? "#f0f2f5" : "",
            }}
          >
            <PlayCircleOutlined />
          </span>
          <span className="label">Playlist</span>
        </NavLink>
      ),
    },

    {
      key: "/playlist-stats",
      label: (
        <NavLink to="/playlist-stats">
          <span
            className="icon"
            style={{
              backgroundColor: selectedKey === "playlist-stats" ? "#f0f2f5" : "",
            }}
          >
            <PieChartOutlined />
          </span>
          <span className="label">Statistik Playlist</span>
        </NavLink>
      ),
    },
  ];

  return (
    <>
      <div className="brand">
        <img src="/logo.png" alt="" />
        <span>UTS Web</span>
      </div>
      <hr />
      <Menu theme="light" mode="inline" selectedKeys={[selectedKey]} items={menuItems} />
    </>
  );
}

export default Sidenav;
