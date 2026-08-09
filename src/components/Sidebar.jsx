import {
    FaCalendarAlt,
    FaChartBar,
    FaSearch,
    FaCog,
    FaFileExport,
} from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Sidebar() {
    const menu = [
        { icon: <FaCalendarAlt />, text: "Calendar", path: "/" },
        { icon: <FaChartBar />, text: "Dashboard", path: "/dashboard" },
        { icon: <FaSearch />, text: "Search", path: "/search" },
        { icon: <FaFileExport />, text: "Export", path: "/export" },
        { icon: <FaCog />, text: "Settings", path: "/settings" },
    ];

    return (
        <div
            style={{
                width: "260px",
                background: "#111827",
                color: "white",
                padding: "20px",
                minHeight: "100vh",
                borderRight: "1px solid #2d3748",
            }}
        >
            <h1
                style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "35px",
                }}
            >
                📅 PW Calendar
            </h1>

            {menu.map((item, index) => (
                <Link
                    key={index}
                    to={item.path}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        color: "white",
                        textDecoration: "none",
                        padding: "12px 15px",
                        marginBottom: "10px",
                        borderRadius: "10px",
                        background: "#1f2937",
                    }}
                >
                    {item.icon}
                    {item.text}
                </Link>
            ))}
        </div>
    );
}