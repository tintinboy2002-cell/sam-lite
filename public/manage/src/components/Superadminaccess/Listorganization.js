import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import httpInjectorService from 'services/http-injector.service';
import {
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  useDisclosure,
  IconButton,
  Select,
  Box,
  Input, // Import Input for editable field
} from '@chakra-ui/react';
import { FaTrash, FaSearch, FaPen, FaCheckCircle } from 'react-icons/fa';
import { Card, CardBody } from 'reactstrap';
import { faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Spinner from 'components/common/Spinner';

const Listorganization = () => {
  const [data, setData] = useState([]);
  const [selectedorg, setSelectedorg] = useState([]);
  const [isEditing, setIsEditing] = useState(null);  // Track which org is being edited
  const [updatedOrgName, setUpdatedOrgName] = useState('');  // Track updated name
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const getorganizations = async () => {
    try {
      const response = await httpInjectorService.listorganization();
      if (response.status === 'success') {
        setData(response.data);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.log(err, 'assignwork');
    } finally {
      setLoading(false);
    }
  };

  const handleUserCheckboxChange = (userId) => {
    setSelectedorg((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId);
      } else {
        return [...prevSelected, userId];
      }
    });
  };

  useEffect(() => {
    getorganizations();
  }, []);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(e.target.value);
  };

  const handleaddbutton = () => {
    navigate('/admin/login/register');
  };

  const editorganization = (id, orgName) => {
    setIsEditing(id);  // Set the org as being edited
    setUpdatedOrgName(orgName); // Set the org's name to the updated value
  };

  const updateorganization = async (id) => {
  let data={id, updatedOrgName}
    try {
      const response = await httpInjectorService.updateorganization(data);
      console.log(updatedOrgName, "updated")
      if (response.status === 'success') {
        toast.success('Organization name updated successfully', {
          position: 'top-right',
          autoClose: 3000,
        });
        //setIsEditing(null);
        getorganizations()
        setData((prevData) =>
            prevData.map((org) =>
              org.user_id === id ? { ...org, org_name: updatedOrgName } : org
            )
          );
        
          
        
          // Exit editing mode
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.log(err, 'update organization');
    }
  };

  const filteredUsers = data.filter((org) => {
    const orgName = org.org_name ? org.org_name.toLowerCase() : '';
    return orgName.includes(searchQuery.toLowerCase());
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const deleteorganization=async (id)=>
  {

    const payload={Id:id}
    try {
        const response = await httpInjectorService.deleteorganization(payload);
        console.log(updatedOrgName, "updated")
        if (response.status === 'success') {
          toast.success(response.message, {
            position: 'top-right',
            autoClose: 3000,
          });
          //setIsEditing(null);
          getorganizations()     
        } else {
          toast.error(response.message, {
            position: 'top-right',
            autoClose: 3000,
          });
        }
      } catch (err) {
        console.log(err, 'update organization');
      }

  }

  return (
    <React.Fragment>
      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          w="100%"
          mt="80px"
        >
          <Spinner size="xl" color="purple.500" />
        </Box>
      )}
      {!loading && (
        <div
          className="page-content"
          style={{ borderRadius: '10px', marginTop: '20px' }}
        >
          <Card
            className="page-content"
            style={{ borderRadius: '10px', marginTop: '70px' }}
          >
            <CardBody>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                  marginTop: '15px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    style={{ marginLeft: '0px', height: '35px' }}
                  >
                    <option value={10}>Show 10 </option>
                    <option value={20}>Show 20 </option>
                    <option value={30}>Show 30 </option>
                    <option value={40}>Show 40 </option>
                  </Select>

                  <label
                    htmlFor="search-bar-0"
                    className="search-label"
                    style={{ width: '100%', position: 'relative' }}
                  >
                    <input
                      onChange={handleSearchChange}
                      id="search-bar-0"
                      type="text"
                      className="form-control"
                      placeholder="Search by Name, Employee ID, Department, Designation"
                      value={searchQuery || ''}
                      style={{
                        paddingRight: '2.5rem',
                        textIndent: '1.5rem',
                        width: '200px',
                        height: '35px',
                        marginLeft: '8px',
                      }}
                    />
                  </label>
                </div>

                <Tooltip
                  label="Register New organization"
                  aria-label="Register New organization"
                >
                  <Button colorScheme="purple">
                    <FontAwesomeIcon icon={faPlus} onClick={handleaddbutton} />
                  </Button>
                </Tooltip>
              </div>

              <Table
                variant="simple"
                borderColor="#c0c0c0"
                borderWidth="1px"
                borderStyle="solid"
                style={{ marginTop: '3px' }}
              >
                <Thead backgroundColor="#B58EE4">
                  <Tr>
                    <Th
                      border="1px solid #ddd"
                      fontWeight="bold"
                      color="black"
                      style={{ width: '10%' }}
                    >
                      Select
                    </Th>
                    <Th
                      border="1px solid #ddd"
                      fontWeight="bold"
                      color="black"
                      style={{ width: '60%' }}
                    >
                      Organizations
                    </Th>
                    <Th
                      border="1px solid #ddd"
                      fontWeight="bold"
                      color="black"
                      style={{ width: '60%' }}
                    >
                      Employees
                    </Th>
                    <Th
                      border="1px solid #ddd"
                      fontWeight="bold"
                      color="black"
                      style={{ width: '10%' }}
                    >
                      Actions
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredUsers?.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <Tr key={index}>
                        <Td
                          border="1px solid #ddd"
                          style={{ width: '10%' }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedorg.includes(user.id)}
                            onChange={() =>
                              handleUserCheckboxChange(user.id)
                            }
                          />
                        </Td>
                        <Td
                          border="1px solid #ddd"
                          color="black"
                          style={{ width: '60%' }}
                        >
                          {isEditing === user.id ? (
                            <Input
                              value={updatedOrgName}
                              onChange={(e) => setUpdatedOrgName(e.target.value)}
                              disabled={isEditing === null}
                            />
                          ) : (
                            user.org_name
                          )}
                        </Td>
                        <Td
                          border="1px solid #ddd"
                          color="black"
                          style={{ width: '60%' }}
                        >
                          {user.employee_count}
                        </Td>
                        <Td
                          border="1px solid #ddd"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          {isEditing === user.id ? (
                            <IconButton
                              icon={<FaCheckCircle/>}
                              onClick={() => updateorganization(user.id)}
                              colorScheme="green"
                              size="sm"
                              aria-label="Save"
                            />
                          ) : (
                            <IconButton
                              icon={<FaPen />}
                              onClick={() => editorganization(user.id, user.org_name)}
                              colorScheme="purple"
                              size="sm"
                              aria-label="Edit"
                            />
                          )}

                          <IconButton
                            icon={<FaTrash />}
                            colorScheme="red"
                            onClick={()=>deleteorganization(user.id)}
                            size="sm"
                            aria-label="Delete"
                          />
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td
                        colSpan="3"
                        style={{
                          textAlign: 'center',
                        }}
                      >
                        No Organization found
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </div>
      )}
    </React.Fragment>
  );
};

export default Listorganization;
