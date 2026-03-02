import React, { useEffect, useState } from 'react';
import { CheckIcon } from '@chakra-ui/icons';
import {
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Text,
  FormControl,
  FormLabel,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Tooltip,
  // Spinner,
  Checkbox,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import httpInjectorService from 'services/http-injector.service';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { DeleteIcon } from '@chakra-ui/icons';
import { Progress, Card } from 'reactstrap'; // Importing Progress from Reactstrap
import { typeOf } from 'react-is';
import { BulletList } from 'react-content-loader';
import { decryptData } from 'utils/crypto';

const EmployeeDoc = ({ activeTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentData, setDocumentData] = useState({
    idType: '',
    selectedFile: null,
    idValue: '',
  });
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState(''); // New state for file format error
  const [isSaving, setIsSaving] = useState(false); // New state to track saving status
  const [checkedState, setCheckedState] = useState({});
  const { id } = useParams();
  const user_id = decryptData(Cookies.get('user_id'));

  const onOpen = () => setIsOpen(true);
  const onClose = () => {
    setIsOpen(false);
    setError(''); // Reset error on close
    setFileError(''); // Reset file error on close
    setUploadProgress(0); // Reset upload progress on close
    setDocumentData({ idType: '', selectedFile: null, idValue: '' }); // Reset document data
  };

  const handleCheckboxChange = (docId) => {
    setCheckedState((prevState) => ({
      ...prevState,
      [docId]: !prevState[docId], // Toggle the checkbox state
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedFormats = ['image/png', 'image/jpeg', 'application/pdf'];
      if (!allowedFormats.includes(file.type)) {
        setFileError('Please upload only PNG, JPG, or PDF files.'); // Set file error
        setDocumentData((prevData) => ({
          ...prevData,
          selectedFile: null,
        }));
        return;
      }
      setFileError(''); // Clear file error if valid
      setDocumentData((prevData) => ({
        ...prevData,
        selectedFile: file,
      }));
    }
  };

  useEffect(() => {
    if (activeTab === '3') {
      getDocuments();
    }
  }, [activeTab]);

  // const getDocuments = async () => {
  //   setIsLoading(true); // Start loading
  //   try {
  //     if (!id) {
  //       throw new Error('Role ID not found in cookies');
  //     }
  //     let response = await httpInjectorService.getdocumentsForAdmin(id);
  //     if (
  //       response &&
  //       response.data &&
  //       Array.isArray(response.data) &&
  //       response.data.length > 0
  //     ) {
  //       const docs = response.data.map((doc) => {
  //         if (doc.file_buffer && doc.file_buffer.data) {
  //           const fileData = new Uint8Array(doc.file_buffer.data);
  //           let mimeType = 'application/octet-stream';
  //           const signature = fileData.subarray(0, 4);

  //           if (
  //             signature[0] === 0x89 &&
  //             signature[1] === 0x50 &&
  //             signature[2] === 0x4e &&
  //             signature[3] === 0x47
  //           ) {
  //             mimeType = 'image/png';
  //           } else if (
  //             signature[0] === 0x25 &&
  //             signature[1] === 0x50 &&
  //             signature[2] === 0x44 &&
  //             signature[3] === 0x46
  //           ) {
  //             mimeType = 'application/pdf';
  //           }

  //           const fileBlob = new Blob([fileData], { type: mimeType });
  //           const fileUrl = URL.createObjectURL(fileBlob);

  //           return {
  //             fileUrl,
  //             filename: doc.file_name,
  //             documentID: doc.document_Id,
  //             filetype: doc.file_type,
  //             verification: doc.verification,
  //             uploadedBy: doc.uploaded_by,
  //             id: doc.id,
  //           };
  //         }
  //         return null;
  //       });

  //       setDocuments(docs.filter((doc) => doc !== null));
  //     } else {
  //       console.log('Error: Response is not in the expected format.');
  //     }
  //   } catch (err) {
  //     console.error('Error fetching documents:', err);
  //   } finally {
  //     setIsLoading(false); // Stop loading
  //   }
  // };

  const getDocuments = async () => {
    setIsLoading(true);
    try {
      if (!id) throw new Error('Role ID not found in cookies');

      const response = await httpInjectorService.getdocumentsForAdmin(id);

      if (response?.data && Array.isArray(response.data)) {
        const docs = response.data.map((doc) => ({
          fileUrl: doc.path,
          filename: doc.file_name,
          documentID: doc.document_Id,
          filetype: doc.file_type,
          verification: doc.verification || 'Pending',
          uploadedBy: doc.uploaded_by || 'Unknown',
          id: doc.id,
        }));

        setDocuments(docs);
      } else {
        console.error('Error: Response is not in the expected format.');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (documentID) => {
    try {
      const response = await httpInjectorService.deletedocs({ id: documentID });
      if (response.status === 'success') {
        setDocuments((prevDocuments) =>
          prevDocuments.filter((doc) => doc.id !== documentID),
        );
      } else {
        console.log('Failed to delete document.');
      }
    } catch (err) {
      console.error('Error occurred while deleting document:', err);
    } finally {
      getDocuments();
    }
  };

  const handleSave = async () => {
    // Prevent multiple submissions
    if (isSaving) return;

    // Validation based on ID type
    if (
      documentData.idType === 'Aadhaar Card' &&
      documentData.idValue.length !== 12
    ) {
      setError('Aadhar ID must be exactly 12 digits.');
      return;
    } else if (
      documentData.idType === 'Pan Card' &&
      documentData.idValue.length !== 10
    ) {
      setError('PAN ID must be exactly 10 characters.');
      return;
    } else {
      setError(''); // Clear error if validation passes
    }

    const formData = new FormData();
    formData.append('file', documentData.selectedFile);
    formData.append('idType', documentData.idType);
    formData.append('idValue', documentData.idValue);
    formData.append('id', id);
    formData.append('user_id', user_id);

    setIsSaving(true); // Set saving state to true
    try {
      const response = await httpInjectorService.UploadDocs(formData, {
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percent = Math.floor((loaded * 100) / total);
          setUploadProgress(percent);
        },
      });

      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        onClose(); // Close modal after successful save
        getDocuments(); // Refresh documents
      }
    } catch (err) {
      toast.error(err, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSaving(false); // Reset saving state
    }
  };

  const handleVerify = async (documentID, id) => {
    const payload = {
      docid: Number(documentID), // Convert to number
      id: Number(id), // Convert to number
    };

    try {
      const response = await httpInjectorService.verifyDocument(payload);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        getDocuments();
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.error(err, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  });


  return (
    <React.Fragment>
      {loading ? (
        <BulletList />
      ) : (
        // <Card
        //   className="shadow p-1 bg-white mb-3"
        //   style={{ marginTop: '20px' }}
        // >
        <>
          <Box className="card-header" mb={4}>Uploaded Documents</Box>
          <Box className="card-body">
            <Box
              overflowX={{ base: 'auto', md: 'visible' }}
              overflowY="hidden"
              width="100%"
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
              }}
              sx={{
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#555',
                },
              }}
            >
              <Table
                variant="simple"
                size="md"
                style={{ borderCollapse: 'collapse', minWidth: '600px', width: '100%' }}
              >
                <Thead>
                  <Tr>
                    {documents.length > 0 && (
                      <>
                        <Th
                          textAlign="center"
                          border="1px solid"
                          borderColor="gray.300"
                        >
                          TYPE
                        </Th>
                        <Th
                          textAlign="center"
                          border="1px solid"
                          borderColor="gray.300"
                        >
                          ID
                        </Th>
                        <Th
                          textAlign="center"
                          border="1px solid"
                          borderColor="gray.300"
                        >
                          VERIFICATION
                        </Th>
                        <Th
                          textAlign="center"
                          border="1px solid"
                          borderColor="gray.300"
                        >
                          ACTIONS
                        </Th>
                      </>
                    )}
                  </Tr>
                </Thead>
                <Tbody>
                  {documents.length > 0 ? (
                    documents.map((doc, index) => (
                      <Tr key={index} border="1px solid" borderColor="gray.300">
                        <Td
                          textAlign="center"
                          border="1px solid"
                          borderColor="gray.300"
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              marginTop: '3',
                            }}
                          >
                            {doc.verification === 'Not Verified' && (
                              <Checkbox
                                onChange={() => handleCheckboxChange(doc.id)}
                              />
                            )}
                            <span style={{ marginLeft: '10px' }}>
                              {doc.filetype}
                            </span>
                          </div>
                        </Td>
                        <Td
                          textAlign="center"
                          border="1px solid"
                          borderColor="gray.300"
                        >
                          {doc.documentID}
                        </Td>
                        <Td
                          textAlign="center"
                          border="1px solid"
                          borderColor="gray.300"
                        >
                          {doc.verification}
                        </Td>
                        <Td
                          textAlign="center"
                          border="1px solid"
                          borderColor="gray.300"
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-around',
                            }}
                          >
                            <div>
                              <Button
                                colorScheme="green"
                                onClick={() => handleVerify(doc.id, id)}
                                isDisabled={!checkedState[doc.id]}
                              >
                                {' '}
                                verify{' '}
                              </Button>
                            </div>
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                colorScheme="purple"
                                size="sm"
                                leftIcon={<FontAwesomeIcon icon={faDownload} />}
                              >
                                Download
                              </Button>
                            </a>
                            <Tooltip
                              label="Delete Document"
                              aria-label="Delete Document"
                            >
                              <IconButton
                                icon={<DeleteIcon />}
                                aria-label="Delete Document"
                                colorScheme="red"
                                size="sm"
                                onClick={() => handleDelete(doc.id)}
                                ml={2}
                              />
                            </Tooltip>
                          </div>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td
                        colSpan="4"
                        textAlign="center"
                        border="1px solid"
                        borderColor="gray.300"
                      >
                        No documents available.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
            {uploadProgress > 0 && (
              <Progress value={uploadProgress} color="success" />
            )}
          </Box>
          <Box className="card-footer text-body-secondary d-flex justify-content-between align-items-center">
            <span>
              <IconButton
                icon={<AddIcon />}
                aria-label="Add"
                colorScheme="teal"
                variant="outline"
                onClick={onOpen}
                boxSize="35px"
                borderRadius="full"
                border="2px solid"
                fontSize="15px"
                _hover={{ backgroundColor: 'teal.100' }}
              />
            </span>
          </Box>
         </> 
        // </Card>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel htmlFor="id-type">Select ID Type</FormLabel>
              <Select
                id="id-type"
                value={documentData.idType || ''}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  setDocumentData((prevData) => ({
                    ...prevData,
                    idType: selectedValue,
                    idValue: '', // Reset ID value when ID type changes
                  }));
                }}
              >
                <option value="">Select ID Type</option>
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="Pan Card">PAN Card</option>
              </Select>
            </FormControl>

            <FormControl mt="4">
              <FormLabel htmlFor="id-input">Enter ID</FormLabel>
              <Input
                id="id-input"
                type="text"
                value={documentData.idValue}
                onChange={(e) =>
                  setDocumentData((prevData) => ({
                    ...prevData,
                    idValue: e.target.value,
                  }))
                }
                placeholder="Enter your ID"
                isInvalid={!!error} // Apply red border if there's an error
                borderColor={error ? 'red.500' : undefined} // Change border color to red
              />
              {error && (
                <Text color="red.500" mt="2">
                  {error}
                </Text>
              )}
            </FormControl>

            <FormControl mt="4">
              <FormLabel htmlFor="file-upload">Choose a file</FormLabel>
              <Input
                id="file-upload"
                type="file"
                accept=".png, .jpg, .jpeg, .pdf"
                onChange={handleFileChange}
              />
              {documentData.selectedFile && (
                <Text mt="2" color="green.500">
                  {`Selected file: ${documentData.selectedFile.name}`}
                </Text>
              )}
              {fileError && (
                <Text color="red.500" mt="2">
                  {fileError}
                </Text>
              )}{' '}
              {/* Display file error here */}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="yellow" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleSave}
              isLoading={isSaving} // Disable button during saving
              loadingText="Saving..."
              disabled={isSaving}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default EmployeeDoc;
