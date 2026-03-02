import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Select,
  Text,
} from "@chakra-ui/react";
import Table from "components/Table/Table.jsx";
import { toast } from "react-toastify";
import httpInjectorService from "services/http-injector.service";

const CompanyReportingManager = ({
  users = [],
  loading = false,
  refreshUsers,
  isAdmin = false,
  isBetaUser = false,
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [manager1, setManager1] = useState("");
  const [manager2, setManager2] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [managers, setManagers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  /* ===============================
     Fetch Managers Master List
  ================================= */
  const fetchManagersList = async () => {
    try {
      const res = await httpInjectorService.getManagersList();
      if (res?.status === "success") {
        setManagers(res.data || []);
      } else {
        toast.error(res?.message || "Failed to fetch managers");
      }
    } catch (error) {
      toast.error("Failed to fetch managers");
    }
  };

  useEffect(() => {
    fetchManagersList();
  }, []);

  /* ===============================
     Modal Controls
  ================================= */
  const openModal = (user) => {
    setSelectedUser(user);

    setManager1(user?.reportingAuthorities?.[0]?.id || "");
    setManager2(user?.reportingAuthorities?.[1]?.id || "");

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setManager1("");
    setManager2("");
    setIsModalOpen(false);
  };

  /* ===============================
     Assign / Update
  ================================= */
  const handleSubmit = async () => {
    if (!selectedUser) return;

    if (!manager1 && !manager2) {
      toast.error("Select at least one manager");
      return;
    }

    if (manager1 && manager2 && manager1 === manager2) {
      toast.error("Managers must be different");
      return;
    }

    const payload = {
      user_id: selectedUser.id,
      manager_id1: manager1 ? Number(manager1) : undefined,
      manager_id2: manager2 ? Number(manager2) : undefined,
    };

    try {
      setSubmitting(true);

      const hasExistingManagers =
        selectedUser?.reportingAuthorities?.length > 0;

      const res = hasExistingManagers
        ? await httpInjectorService.updateReportingManager(payload)
        : await httpInjectorService.assignReportingManager(payload);

      if (res?.status === "success") {
        toast.success(res.message);
        closeModal();
        refreshUsers();
      } else {
        toast.error(res?.message || "Operation failed");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveManager = async (userId, slot) => {

    console.log("Remove clicked", userId);

    const payload = {
      user_id: userId,
      // Use explicit slot (1 or 2) instead of array index
      remove_manager1: slot === 1,
      remove_manager2: slot === 2,
    };

    try {
      const res =
        await httpInjectorService.removeUserReportingManager(payload);

      if (res?.status === "success") {
        toast.success(res?.message);
        refreshUsers();
      } else {
        toast.error(res?.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to remove manager"
      );
    }
  };

  const columns = useMemo(() => {
    const baseColumns = [
      { header: "Username", accessor: "name" },
      ...(isBetaUser ? [] : [{ header: "Role", accessor: "role" }]),
      { header: "Department", accessor: "department" },
      { header: "Designation", accessor: "designation" },
      {
        header: "Reporting Managers",
        accessor: "reportingAuthorities",
        cell: (row) =>
          row.reportingAuthorities?.length ? (
            row.reportingAuthorities.map((m, index) => {
              const slot = m.slot || index + 1;
              return (
              <Box
                key={m.id}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Text fontSize="sm">
                  {m.name} - {m.designation}
                </Text>

                {isAdmin && (
                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={() => handleRemoveManager(row.id, slot)}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            )})
          ) : (
            "Assign Manager"
          ),
      },
    ];
    if (!isAdmin) return baseColumns;

    return [
      ...baseColumns,
      {
        header: "Actions",
        accessor: "actions",
        cell: (row) => (
          <Button
            size="sm"
            colorScheme="teal"
            onClick={() => openModal(row)}
          >
            Assign
          </Button>
        ),
      },
    ];
  }, [isAdmin, isBetaUser]);

  /* ===============================
     Render
  ================================= */
  return (
    <>
      <Box className="card-header" py={2}>
        Reporting Manager
      </Box>

      <Table data={users} columns={columns} loading={loading} />

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Manage Reporting Managers for {selectedUser?.name}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Select
              placeholder="Select Manager 1"
              value={manager1}
              onChange={(e) => setManager1(e.target.value)}
              mb={3}
            >
              {managers.map((manager) => (
                <option
                  key={manager.reporting_manager_record_id}
                  value={manager.reporting_manager_record_id}
                >
                  {manager.manager_name}
                </option>
              ))}
            </Select>

            <Select
              placeholder="Select Manager 2 (Optional)"
              value={manager2}
              onChange={(e) => setManager2(e.target.value)}
            >
              {managers.map((manager) => (
                <option
                  key={manager.reporting_manager_record_id}
                  value={manager.reporting_manager_record_id}
                >
                  {manager.manager_name}
                </option>
              ))}
            </Select>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={closeModal}>
              Cancel
            </Button>

            <Button
              colorScheme="green"
              onClick={handleSubmit}
              isLoading={submitting}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CompanyReportingManager;