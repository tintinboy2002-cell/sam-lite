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
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { DeleteIcon } from '@chakra-ui/icons';
import httpInjectorService from 'services/http-injector.service';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
// import Spinner from 'components/common/Spinner';
import { BulletList } from 'react-content-loader';
import { Card } from 'reactstrap';
import { decryptData } from 'utils/crypto';

const EmployeeDoc = ({ activeTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentData, setDocumentData] = useState({
    idType: '',
    selectedFile: null,
    idValue: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState(''); // New state for file format error
  const [isSaving, setIsSaving] = useState(false); // New state to track saving status
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [docId, setDocId] = useState(null);

  const id = decryptData(Cookies.get('user_id'));

  const onOpen = () => setIsOpen(true);
  const onClose = () => {
    setDocumentData({ idType: '', selectedFile: null, idValue: '' });
    setError('');
    setFileError(''); // Reset file error on close
    setIsOpen(false);
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
    getDocuments();
  }, [activeTab]);

  const getDocuments = async () => {
    setLoading(true);
    try {
      if (!id) throw new Error('User ID not found in cookies');
      const response = await httpInjectorService.getdocuments(id);

      if (response?.data && Array.isArray(response.data)) {
        const docs = response.data.map((doc) => ({
          fileUrl: doc.path,
          filename: doc.file_name,
          documentID: doc.document_Id,
          filetype: doc.file_type,
          verification: doc.verification || 'Pending',
          uploadedBy: doc.uploaded_by,
          id: doc.id,
        }));

        setDocuments(docs);
      } else {
        console.error('Error: Response is not in the expected format.');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Prevent multiple submissions
    if (isSaving) return;

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

    setIsSaving(true); // Set saving state to true
    try {
      const response = await httpInjectorService.UploadDocs(formData);
      if (response.status === 'success') {
        toast.success('Document uploaded successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        onClose();
        getDocuments(); // Refresh documents after upload
      } else {
        toast.error('Failed to upload document.', {
          position: 'top-right',
          autoClose: 3000,
        });
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

  const handleDelete = async (documentID) => {
    try {
      const response = await httpInjectorService.deletedocs({ id: docId });
      if (response.status === 'success') {
        setDocuments(documents.filter((doc) => doc.id !== docId));
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        setDocId(null);
        onDeleteClose();
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        setDocId(null);
        onDeleteClose();
      }
    } catch (err) {
      toast.error(err, {
        position: 'top-right',
        autoClose: 3000,
      });
      setDocId(null);
      onDeleteClose();
    }
  };

  const handleDeleteModal = (id) => {
    setDocId(id);
    onDeleteOpen();
  };

  const handleDirectDownload = (fileUrl, filename) => {
    fetch(fileUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename || 'document';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error('Download failed:', error);
      });
  };

  return (
    <>
      {/* <Card className="shadow p-1 bg-white mb-3" style={{ marginTop: '20px' }}> */}
        <Box className="card-header">Uploaded Documents</Box>
        <Box className="card-body">
          {loading ? (
            <BulletList/>
          ) : (
            <Table
              variant="simple"
              size="md"
              style={{ borderCollapse: 'collapse' }}
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
                        {doc.filetype}
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
                            onClick={() => handleDeleteModal(doc.id)}
                            ml={2}
                          />
                        </Tooltip>
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
      {/* </Card> */}
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
                value={documentData.idType}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  setDocumentData((prevData) => ({
                    ...prevData,
                    idType: selectedValue,
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
                borderColor={error ? 'red.500' : undefined}
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
                accept="image/*, .pdf, .docx, .txt"
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

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to delete this document?</ModalBody>
          <ModalFooter>
            <Button onClick={onDeleteClose} colorScheme="purple" mr={3}>
              No
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EmployeeDoc;
