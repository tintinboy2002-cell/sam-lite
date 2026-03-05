import React, { useEffect, useState } from "react";
import httpInjectorService from "services/http-injector.service";
import CompanyReportingManager from "./CompanyReportingManager";
import MyProfileReportingPanel from "./MyProfileReportingPanel";
import { decryptData } from "utils/crypto";
import Cookies from "js-cookie";

const ReportingContainer = () => {
  const roleId = Number(decryptData(Cookies.get("role_id")));
  const userId = Number(decryptData(Cookies.get("user_id")));

  const isAdmin = roleId === 1 || roleId === 2;
  const isBetaUser = roleId === 3;

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
    if (isAdmin) {
      fetchUsers(); // Only admins fetch full company list
    }
  }, [isAdmin]);

  // Get only current user object
  const currentUser = users.find((u) => u.id === userId);

  return (
    <>
      {isAdmin && (
        <CompanyReportingManager
          users={users}
          setUsers={setUsers}
          loading={loading}
          refreshUsers={fetchUsers}
          isAdmin={isAdmin}
          isBetaUser={isBetaUser}
        />
      )}

      {isBetaUser && (
        <MyProfileReportingPanel currentUser={currentUser} />
      )}
    </>
  );
};

export default ReportingContainer;