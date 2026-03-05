import React, { useEffect, useState } from "react";
import { Box, Text, Spinner } from "@chakra-ui/react";
import httpInjectorService from "services/http-injector.service";

const MyProfileReportingPanel = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch both assigned manager to view for each employee
  const fetchAssignedManagers = async () => {
    try {
      setLoading(true);

      const res =
        await httpInjectorService.getUserAssignedManagers();

      if (res?.status === "success" && res?.data?.length) {
        const data = res.data[0]; // only one user row

        const formattedManagers = [
          data.reporting_manager1_username && {
            id: data.reporting_manager1_user_id,
            name: data.reporting_manager1_username,
            department: data.reporting_manager1_department,
            designation: data.reporting_manager1_designation,
            status: data.reporting_manager1_status,
          },
          data.reporting_manager2_username && {
            id: data.reporting_manager2_user_id,
            name: data.reporting_manager2_username,
            department: data.reporting_manager2_department,
            designation: data.reporting_manager2_designation,
            status: data.reporting_manager2_status,
          },
        ].filter(Boolean);

        setManagers(formattedManagers);
      }
    } catch (error) {
      console.error("Fetch Assigned Managers Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedManagers();
  }, []);

  return (
    <Box>
      <Text fontWeight="bold" fontSize="lg" mb={4}>
        Reporting Manager
      </Text>

      {loading && <Spinner />}

      {!loading && managers.length === 0 && (
        <Box>No reporting manager assigned.</Box>
      )}

      {!loading &&
        managers.map((manager) => (
          <Box
            key={manager.id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            mb={3}
          >
            <Text fontWeight="semibold">{manager.name}</Text>
            <Text fontSize="sm" color="gray.600">
              {manager.department}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {manager.designation}
            </Text>
          </Box>
        ))}
    </Box>
  );
};

export default MyProfileReportingPanel;