import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Icon,
  Link,
  Text,
  Avatar,
  useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import AdminNavbarLinks from 'components/navbar/NavbarLinksAdmin';
import Cookies from 'js-cookie';
import { IoMenuOutline } from 'react-icons/io5';
import httpInjectorService from 'services/http-injector.service';
import { useDispatch, useSelector } from 'react-redux';
import { setUsername } from 'store/actions';

export default function AdminNavbar(props) {
  const [scrolled, setScrolled] = useState(false);
  const username = useSelector((state) => state.Authentication.username);
  const dispatch = useDispatch();

  useEffect(() => {
    window.addEventListener('scroll', changeNavbar);
    return () => {
      window.removeEventListener('scroll', changeNavbar);
    };
  }, []);

  const getUserDetails = async () => {
    try {
      const response = await httpInjectorService.getUsersDetails();
      if (response.status === 'success') {
        dispatch(setUsername(response.data.username));
      } else {
        dispatch(setUsername(''));
      }
    } catch (err) {
      dispatch(setUsername(''));
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  const { secondary, message, brandText } = props;
  const { setIsCollapsed, isCollapsed } = props;

  const changeNavbar = () => {
    if (window.scrollY > 1) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  // Modern color scheme
  const navbarBg = useColorModeValue(
    'rgba(255, 255, 255, 0.8)',
    'rgba(26, 32, 44, 0.8)',
  );
  const borderColor = useColorModeValue(
    'rgba(226, 232, 240, 0.8)',
    'rgba(255, 255, 255, 0.1)',
  );
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      position="fixed"
      top="0"
      left={{ base: '0', md: '0', lg: '80px' }}
      right="0"
      // bg={navbarBg}
      bg="#884b9e"
      backdropFilter="saturate(180%) blur(10px)"
      borderBottom="1px solid"
      borderColor={borderColor}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      boxShadow={scrolled ? 'sm' : 'none'}
      sx={{
        '::-webkit-scrollbar': {
          display: 'none',
        },
        '-ms-overflow-style': 'none',
        'scrollbar-width': 'none',
      }}
    >
      <Flex
        h="60px"
        alignItems="center"
        justifyContent="space-between"
        px={{ base: '16px', md: '24px', lg: '32px' }}
        maxW="100%"
        mx="auto"
        mt="10px"
      >
        {/* Left Section - User Greeting */}
        <Flex
          display={{ base: 'none', md: 'flex' }}
          alignItems="center"
          gap="12px"
        >
          <Box>
            <Text fontSize="20px" fontWeight="600" color="white" lineHeight="1">
              Welcome back
            </Text>
            <Text fontSize="13px" color="white" lineHeight="1.2" mt="2px">
              {username || 'Guest'}
            </Text>
          </Box>
        </Flex>

        {/* Mobile Left Section */}
        <Flex display={{ base: 'flex', md: 'none' }}>
          <Box>
          <Text fontSize="16px" fontWeight="600" color="white" mb="0px">
            Hello
          </Text>
          <Text fontSize="12px" fontWeight="400" color="white">
            {username || 'Dashboard'}
          </Text>
          </Box>
        </Flex>

        {/* Right Section - Navigation Links */}
        <Box ml="auto">
          <AdminNavbarLinks
            onOpen={props.onOpen}
            logoText={props.logoText}
            secondary={props.secondary}
            fixed={props.fixed}
            scrolled={scrolled}
          />
        </Box>
      </Flex>

      {/* Secondary Message */}
      {secondary && message && (
        <Box px={{ base: '16px', md: '24px', lg: '32px' }} pb="12px" pt="4px">
          <Text fontSize="13px" color={secondaryTextColor} fontWeight="500">
            {message}
          </Text>
        </Box>
      )}
    </Box>
  );
}
