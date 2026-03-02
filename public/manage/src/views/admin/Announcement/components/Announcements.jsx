import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { decryptData } from 'utils/crypto';
import NotificationLists from './UI/AnnouncementLists';
import CreateAnnouncementForm from './UI/CreateAnnouncementForm';
import { Plus, Bell } from 'lucide-react';
import { toast } from 'react-toastify';
import { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Icon,
  useDisclosure,
  Center,
  Card,
} from '@chakra-ui/react';
import httpInjectorService from 'services/http-injector.service';
import SkeletonWithLoaders from 'components/common/Spinner';

// Notification UI
const Announcements = () => {
  const currentUser = {
    // Admin
    role: decryptData(Cookies.get('role_id')),
  };

  // State management
  const [announcements, setAnnouncements] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Logic to delete a announcement
  const handleDeleteAnnouncement = async (announcement_id) => {
    console.log('id', announcement_id);
    try {
      // API call to delete announcement
      const response = await httpInjectorService.deleteAnnouncement({
        announcement_id,
      });
      if (response?.status === 'success') {
        const updatedAnnouncements = announcements.filter(
          (ann) => ann.announcement_id !== announcement_id,
        );
        setAnnouncements(updatedAnnouncements);
        toast.success('Announcement deleted successfully');
      } else {
        toast.error(response?.message || 'Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  // CREATE ANNOUNCEMENT HANDLER
  const handleCreateAnnouncement = async (formData) => {
    try {
      // Build payload
      const payload = {
        title: formData.title,
        message: formData.message,
        // file: formData.file || null, // already a File object
      };

      // Convert payload → FormData
      const formDataToSend = new FormData();

      Object.keys(payload).forEach((key) => {
        if (key === 'file') {
          if (payload.file) {
            formDataToSend.append('file', payload.file); // Correct: direct file upload
          }
        } else {
          formDataToSend.append(key, payload[key]);
        }
      });

      const response = await httpInjectorService.createAnnouncement(
        formDataToSend,
      );

      if (response?.status === 'success') {
        toast.success('Announcement created successfully!');

        // Update UI immediately after creating an announcement
        await fetchAnnouncements();

        handleModalClose();
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Error creating announcement');
    }
  };

  const handleUpdateAnnouncement = async (formData, announcement_id) => {
    try {
      const payload = {
        announcement_id,
        title: formData.title,
        message: formData.message,
      };

      // If a NEW file is uploaded → include file
      if (formData.file instanceof File) {
        payload.file = formData.file;
      }

      // Convert → FormData
      const formDataToSend = new FormData();
      Object.keys(payload).forEach((key) => {
        formDataToSend.append(key, payload[key]);
      });

      const response = await httpInjectorService.updateAnnouncement(
        formDataToSend,
      );

      if (response?.status === 'success') {
        toast.success('Announcement updated successfully');
        await fetchAnnouncements();
        handleModalClose();
      }
    } catch (error) {
      console.error(error);
      toast.error('Update failed');
    }
  };

  // get all announcements from backend API
  const fetchAnnouncements = async () => {
    try {
      const response = await httpInjectorService.getAnnouncement();
      if (response?.status === 'success') {
        const fetchData = response.data || [];
        setAnnouncements(fetchData);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    }
  };

  const handleModalClose = () => {
    onClose();
    setEditingId(null);
  };

  const handleEdit = (notification) => {
    setEditingId(notification.announcement_id);
    onOpen();
  };

  // Download file
  const handleDownload = async (announcement_id, attachment_url) => {
    try {
      var url = ` /api/auth/download_announcement/${announcement_id}`;
      url = `${process.env.REACT_APP_API_URL}` + url;
      const tokenid = localStorage.getItem('authUser');

      // Axios request for PDF
      const response = await axios.get(url, {
        responseType: 'blob', // important for binary data
        headers: {
          tokenid, // include token if needed
        },
      });

      // Extract filename from headers if available
      const contentDisposition =
        response.headers['content-disposition'] ||
        response.headers['Content-Disposition'];
      let fileName = `announcement_${attachment_url}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match && match[1]) fileName = match[1];
      }

      // Create blob and trigger download
      const blobUrl = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);

      toast.success('Download started');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download file');
    }
  };

  //call fetchAnnouncements api
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <SkeletonWithLoaders>
      {/* <Card  bg="gray.100"  backgroundColor="gray.100"> */}
      <section>
        <Container
          maxW="6xl"
          px={4}
          py={6}
          minH="100vh"
          mt={{ base: 15, md: 20 }}
        >
          {/* Admin: Add Button */}
          {currentUser.role === 2 && (
            <Box
              mb={6}
              display="flex"
              flexDirection={{ base: 'column', sm: 'column', md: 'row' }}
              gap={{ base: 4, md: 0 }}
              width={{ base: '100%', md: 'auto' }}
              justifyContent={{ base: 'space-between', md: 'space-between' }}
            >
              <Box fontSize={{ base: '3xl', md: '3xl' }} fontWeight="medium">
                Announcements
              </Box>
              
              <Button
                colorScheme="blue"
                size={{ base: 'md', sm: 'md', md: 'md' }}
                leftIcon={<Plus className="w-5 h-5" />}
                onClick={() => {
                  setEditingId(null);
                  onOpen();
                }}
              >
                New Announcement
              </Button>
            </Box>
          )}

          {/* Announcement Form Modal */}
          {isOpen && currentUser.role === 2 && (
            <Modal
              isOpen={isOpen}
              onClose={handleModalClose}
              size="2xl"
              scrollBehavior="inside"
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader bg="gray.50" borderBottomWidth="1px">
                  {editingId
                    ? 'Update Announcement'
                    : 'Create New Announcement'}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody p={6}>
                  <CreateAnnouncementForm
                    onCreate={handleCreateAnnouncement}
                    onUpdate={handleUpdateAnnouncement}
                    onDownload={handleDownload}
                    editingData={
                      editingId
                        ? announcements.find(
                            (a) => a.announcement_id === editingId,
                          )
                        : null
                    }
                    onCancel={handleModalClose}
                  />
                </ModalBody>
              </ModalContent>
            </Modal>
          )}

          {/* Announcements List */}
          <VStack spacing={4} align="stretch">
            {announcements.length === 0 ? (
              <Box
                bg="white"
                borderRadius="lg"
                shadow="sm"
                borderWidth="1px"
                p={12}
              >
                <Center flexDirection="column">
                  <Icon as={Bell} boxSize={16} color="gray.300" mb={4} />
                  <Heading size="md" color="gray.600" mb={2}>
                    No Announcements Yet
                  </Heading>
                  <Text color="gray.500" textAlign="center">
                    {currentUser.role === 'admin'
                      ? 'Click the "New Announcement" button to create your first announcement.'
                      : 'Check back later for updates from your administrator.'}
                  </Text>
                </Center>
              </Box>
            ) : (
              <NotificationLists
                notifications={announcements}
                onEdit={handleEdit}
                onDelete={handleDeleteAnnouncement}
                handleDownload={handleDownload}
                isAdmin={currentUser.role === 2}
              />
            )}
          </VStack>
        </Container>
      </section>
      {/* </Card> */}
    </SkeletonWithLoaders>
  );
};

export default Announcements;
