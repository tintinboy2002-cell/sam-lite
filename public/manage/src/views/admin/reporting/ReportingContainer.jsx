import React, { useEffect, useState } from 'react';
import httpInjectorService from 'services/http-injector.service';
import CompanyReportingManager from './CompanyReportingManager';
import MyProfileReportingPanel from './MyProfileReportingPanel';
import { decryptData } from 'utils/crypto';
import Cookies from 'js-cookie';

// Parent component that shares state
const ReportingContainer = () => {

    const roleId = decryptData(Cookies.get('role_id'));
    const isAdmin = Number(roleId) === 1 || Number(roleId) === 2;
    const isBetaUser = Number(roleId) === 3 || roleId == 3 || (roleId && String(roleId).trim() === "3");
    const user_id = Number(decryptData(Cookies.get('user_id')));

    console.log('Is Admin', isAdmin);
    console.log('Current user Id', user_id);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
  
      const res = await httpInjectorService.getUsersReportingList();
  
      const formattedUsers = res.data.map((user) => ({
        id: user.user_id,
        name: user.username,
        role: user.role,
        department: user.department_name,
        designation: user.designation_name,
        reportingAuthorities: [
          user.reporting_manager1_name && {
            id: user.reporting_manager1_record_id,
            name: user.reporting_manager1_name,
            slot: 1,
          },
          user.reporting_manager2_name && {
            id: user.reporting_manager2_record_id,
            name: user.reporting_manager2_name,
            slot: 2,
          },
        ].filter(Boolean),
      }));
  
      setUsers(formattedUsers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <CompanyReportingManager
        users={users}
        setUsers={setUsers}
        loading={loading}
        refreshUsers={fetchUsers}
        isAdmin={isAdmin}
        isBetaUser={isBetaUser}
      />

      {/* <MyProfileReportingPanel
        users={users}
        setUsers={setUsers}
        currentUserId={user_id}
        isAdmin={isAdmin}
      /> */}
    </>
  );
};

export default ReportingContainer;