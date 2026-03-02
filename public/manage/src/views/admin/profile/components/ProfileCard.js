import React, { useState, useEffect, useRef } from 'react';

import { toast } from 'react-toastify';
import {
  Box,
  Avatar,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Icon,
  Center,
} from '@chakra-ui/react';
import {
  FaStar,
  FaEnvelope,
  FaBriefcase,
  FaClock,
  FaUser,
} from 'react-icons/fa';

import httpInjectorService from 'services/http-injector.service';
// const roleId = decryptData(Cookies.get('role_id'));
import { decryptData } from 'utils/crypto';

import Cookies from 'js-cookie';
import { Tooltip } from '@chakra-ui/react';
import { Pencil } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { clockInSuccess, clockInFailure, clockOutSuccess, clockOutFailure } from 'store/clockIn/action';

// Removed incorrect import of handleClockIn/handleClockOut from NavbarLinksAdmin

// ProfileCard Component
const ProfileCard = () => {
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const { clockInData } = useSelector((state) => state.clockIn || {});
  const profileimage = useSelector((state) => state);
  const profileData = profileimage.Authentication.profiledata;
  const clockInAtMs = clockInData?.clockInAtMs || null;
  const isCheckedIn = !!clockInAtMs;

  const username = Cookies.get('username');
  const email = Cookies.get('email');

  const [formData, setFormData] = useState({
    username: '',
    officialEmail: '',
    designation: '',
  });

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [image, setImage] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Prefer image from Redux profile data when available
  useEffect(() => {
    if (profileData && profileData.image_url) {
      setImage(profileData.image_url);
    }
  }, [profileData]);

  // Fetch user data on component mount
  const getUserData = async () => {
    try {
      const id = decryptData(Cookies.get('user_id'));
      if (!id) {
        throw new Error('Role ID not found in cookies');
      }

      const response = await httpInjectorService.getProfiledetails(id);
      if (
        response &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const userProfile = response.data[0];
        console.log('userProfile', userProfile);
        setFormData({
          username: userProfile.username || '',
          officialEmail: userProfile.official_email_id || '',
          designation: userProfile.designations || '',
        });

        // ✅ Load user image here
        if (userProfile.image_url) {
          setImage(userProfile.image_url);
        }
      } else {
        toast.error('User not found');
      }
    } catch (error) {
      toast.error('Failed to load user data');
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = String(Math.floor((totalSeconds ?? 0) / 3600)).padStart(
      2,
      '0',
    );
    const minutes = String(
      Math.floor(((totalSeconds ?? 0) % 3600) / 60),
    ).padStart(2, '0');
    const seconds = String((totalSeconds ?? 0) % 60).padStart(2, '0');
    return `${hours} : ${minutes} : ${seconds}`;
  };

  // Hydrate Redux with server clock-in if needed
  useEffect(() => {
    const initClockIn = async () => {
      try {
        if (clockInAtMs) return;
        const response = await httpInjectorService.getclockin();
        const timestamp = response?.data;
        if (timestamp) {
          const serverDate = new Date(timestamp * 1000);
          const istDate = new Date(
            serverDate.toLocaleString('en-US', {
              timeZone: 'Asia/Kolkata',
              hour12: false,
            }),
          );
          dispatch(clockInSuccess({ clockInAtMs: istDate.getTime() }));
        }
      } catch (e) {
        // ignore
      }
    };
    initClockIn();
  }, [clockInAtMs, dispatch]);

  // Elapsed timer derived from Redux clockInAtMs
  useEffect(() => {
    let interval;
    if (clockInAtMs) {
      interval = setInterval(() => {
        const diffMs = Date.now() - clockInAtMs;
        const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
        setElapsedSeconds(totalSeconds);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [clockInAtMs]);

  const handleClockIn = async () => {
    try {
      setIsButtonDisabled(true);
      const response = await httpInjectorService.clockin();
      if (response?.status === 'success') {
        toast.success(response?.message || 'Successfully clocked in');
        const nowIst = new Date(
          new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour12: false,
          }),
        );
        dispatch(clockInSuccess({ clockInAtMs: nowIst.getTime(), response }));
      } else {
        toast.error(response?.message || 'Failed to clock in');
        dispatch(clockInFailure(response?.message || 'Clock-in failed'));
      }
    } catch (error) {
      toast.error('Failed to clock in');
      dispatch(clockInFailure(error?.message || 'Clock-in error'));
    } finally {
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 5000);
    }
  };
  
  const handleClockOut = async () => {
    try {
      setIsButtonDisabled(true);
      const response = await httpInjectorService.clockout();
      if (response?.status === 'success') {
        toast.success(response?.message || 'Successfully clocked out');
        dispatch(clockOutSuccess(response));
      } else {
        toast.error(response?.message || 'Failed to clock out');
        dispatch(clockOutFailure(response?.message || 'Clock-out failed'));
      }
    } catch (error) {
      toast.error('Failed to clock out');
      dispatch(clockOutFailure(error?.message || 'Clock-out error'));
    } finally {
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 5000);
    }
  };

  //  upload image function
  const saveImage = async () => {
    const formDataa = new FormData();
    const id = decryptData(Cookies.get('user_id'));
    formDataa.append('file', inputRef.current.files[0]); // Append file from inputRef
    formDataa.append('id', id);
    try {
      // here we are calling upload image api
      const response = await httpInjectorService.uploadImage(formDataa);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error('Error while saving image:', err);
    }
  };

  const handleImageClick = () => {
    inputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
      setUploaded(true);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  // Trigger saveImage when image state changes and uploaded is true
  useEffect(() => {
    if (uploaded) {
      saveImage();
    }
  }, [image]);

  return (
    <Box
      position="relative"
      w={{ base: '100%', md: '100%', lg: '400px' }}
      bg="white"
      borderRadius="2xl"
      boxShadow="2xl"
      p={8}
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.05)' }}
    >
      {/* Star Badge */}
      <Box position="absolute" top={6} right={6}>
        <Icon as={FaStar} w={6} h={6} color="yellow.400" />
      </Box>

      {/* Avatar */}
      <Center mb={6}>
        <Box position="relative">
          {(image || (profileData && profileData.image_url)) ? (
            <Avatar
              size="2xl"
              name={formData.username || username}
              src={image || (profileData && profileData.image_url)}
              // bg="linear-gradient(to bottom right, #E9D5FF, #BFDBFE)"
            />
          ) : (
            <Avatar
              size="2xl"
              name={formData.username || username}
              bg="linear-gradient(to bottom right, #E9D5FF, #BFDBFE)"
            />
          )}
          <Box
            position="absolute"
            bottom="0"
            right="0"
            bg="white"
            p="6px"
            borderRadius="full"
            boxShadow="md"
            cursor="pointer"
            onClick={handleImageClick}
          >
            <Pencil size={20} />
          </Box>
          <input
            type="file"
            ref={inputRef}
            onChange={handleImageChange}
            style={{ display: 'none', paddingLeft: '2px' }}
            accept="image/*"
          />
        </Box>
      </Center>

      {/* Name */}
      <Text
        fontSize="2xl"
        fontWeight="bold"
        textAlign="center"
        color="gray.800"
        mb={6}
      >
        {formData.username || username}
      </Text>

      {/* Info Grid */}
      <VStack spacing={4} mb={6} align="stretch">
        <HStack spacing={3}>
          <Center w={10} h={10} bg="gray.200" borderRadius="full">
            <Icon as={FaEnvelope} w={5} h={5} color="gray.600" />
          </Center>
          <Text fontSize="md" color="gray.600" mt={3}>
            {formData.officialEmail || email}
          </Text>
        </HStack>

        <HStack spacing={3}>
          <Center w={10} h={10} bg="gray.200" borderRadius="full">
            <Icon as={FaBriefcase} w={5} h={5} color="gray.600" />
          </Center>
          <Text fontSize="sm" color="gray.600" mt={3}>
            {formData.designation}
          </Text>
        </HStack>

        <HStack spacing={3}>
          <Center w={10} h={10} bg="gray.200" borderRadius="full">
            <Icon as={FaClock} w={5} h={5} color="gray.600" />
          </Center>
          <Text fontSize="sm" fontWeight="semibold" color="gray.600" mt={3}>
            {formatTime(elapsedSeconds)}
          </Text>
        </HStack>
      </VStack>

      {/* Action Buttons */}
      <HStack justify="center" spacing={4} mb={6}>
        <Tooltip
          label={formData.officialEmail || email}
          bg="white"
          color="gray.800"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="md"
          hasArrow
        >
          <IconButton
            icon={<Icon as={FaEnvelope} />}
            aria-label="Email"
          />
        </Tooltip>
        <Tooltip
          label={formData.username || username}
          bg="white"
          color="gray.800"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="md"
          hasArrow
        >
          <IconButton
            icon={<Icon as={FaUser} />}
            aria-label="Profile"
          />
        </Tooltip>
        <Tooltip
          label={formData.designation}
          bg="white"
          color="gray.800"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="md"
          hasArrow
        >
          <IconButton
            icon={<Icon as={FaBriefcase} />}
            aria-label="Work"
          />
        </Tooltip>
      </HStack>

      {/* Check In/Out Button */}
      <Button
        w="full"
        py={3}
        borderRadius="full"
        fontWeight="bold"
        colorScheme={isCheckedIn ? 'red' : 'purple'}
        onClick={isCheckedIn ? handleClockOut : handleClockIn}
        isDisabled={isButtonDisabled}
        _disabled={{
          opacity: 0.75,
          cursor: 'not-allowed',
        }}
      >
        {isCheckedIn ? 'CLOCK OUT' : 'CLOCK IN'}
      </Button>
    </Box>
  );
};

export default ProfileCard;
