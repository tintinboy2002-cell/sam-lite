import React from 'react'
import { FaPlane, FaRegBuilding , FaCheckSquare, FaTasks} from 'react-icons/fa';
import { BsPersonCircle ,BsCashCoin } from "react-icons/bs";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { FaRegFileZipper ,FaRegFileImage } from "react-icons/fa6";
import { LuPlane } from "react-icons/lu";

 
const OperationTables =[
    { icon: <FaRegBuilding  />, label: "Company Profile", path: '/admin/company-profile',},
    { icon: <BsPersonCircle />, label: "My Profile",  path: '/admin/my-profile',},
    { icon: <FaRegFileZipper />, label: "Directory",path: '/admin/directory',},
    { icon: <BsCashCoin  />, label: "Payroll",  path: '/admin/payroll',},
    // { icon: <LuPlane />, label: "Travel", path: '/admin/leaves',},
    { icon: <FaTasks />, label: "Attendence", path: '/admin/attendance', },
    { icon: <FaRegFileImage />, label: "Leave", path: '/admin/leaves', },
    { icon: <IoCalendarNumberOutline />, label: "Holiday Calender", path: '/admin/holiday-calender', },
    { icon: <RiCalendarScheduleLine />, label: "Work Week", path: '/admin/workweek', },
]
 
export default OperationTables