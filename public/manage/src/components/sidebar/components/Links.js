/* eslint-disable */
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
// chakra imports
import {
  Box,
  Flex,
  HStack,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';

export function SidebarLinks({ routes, isCollapsed , onClose }) {
  //   Chakra color mode
  let location = useLocation();
  let activeColor = useColorModeValue('gray.700', 'white');
  let inactiveColor = useColorModeValue(
    'secondaryGray.600',
    'secondaryGray.600',
  );
  let activeIcon = useColorModeValue('brand.500', 'white');
  let textColor = useColorModeValue('secondaryGray.500', 'white');
  let brandColor = useColorModeValue('brand.500', 'brand.400');

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (route.category) {
        return (
          <>
            <Text
              fontSize={'md'}
              color={activeColor}
              fontWeight="bold"
              mx="auto"
              ps={{
                sm: '10px',
                xl: '16px',
              }}
              pt="18px"
              pb="12px"
              key={index}
            >
              {route.name}
            </Text>
            {createLinks(route.items)}
          </>
        );
      } else if (
        route.layout === '/admin' ||
        route.layout === '/auth' ||
        route.layout === '/rtl'
      ) {
        return (
          <NavLink key={index} to={route.layout + route.path} onClick={onClose}>
            <Box w="100%" marginLeft="6px">
              <Flex
                direction={isCollapsed ? 'column' : 'row'}
                alignItems="center"
                justifyContent={isCollapsed ? 'center' : 'flex-start'}
                py="0"
                px="3"
                // gap={isCollapsed ? '2' : '3'}
                borderRadius="lg"
                // bg={
                //   activeRoute(route.path.toLowerCase())
                //     ? useColorModeValue('gray.100', 'whiteAlpha.100')
                //     : 'transparent'
                // }
                transition="all 0.2s"
                textAlign="center"
              >
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  w="35px"
                  h="35px"
                  borderRadius="7"
                  bg={
                    activeRoute(route.path.toLowerCase())
                      ? useColorModeValue('brand.100', 'whiteAlpha.100')
                      : useColorModeValue('gray.100', 'whiteAlpha.50')
                  }
                  color={
                    activeRoute(route.path.toLowerCase())
                      ? brandColor
                      : textColor
                  }
                  boxShadow="sm"
                >
                  {route.icon}
                </Box>

                {isCollapsed ? (
                  <Text
                    fontSize="10px"
                    mt="1"
                    color={
                      activeRoute(route.path.toLowerCase())
                        ? activeColor
                        : textColor
                    }
                    fontWeight={
                      activeRoute(route.path.toLowerCase())
                        ? 'semibold'
                        : 'normal'
                    }
                    maxW="55px"
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="normal"
                    lineHeight="short"
                  >
                    {route.name}
                  </Text>
                ) : (
                  <>
                    <Text
                      fontSize="sm"
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? activeColor
                          : textColor
                      }
                      fontWeight={
                        activeRoute(route.path.toLowerCase())
                          ? 'bold'
                          : 'normal'
                      }
                      noOfLines={1}
                      isTruncated
                      maxW="150px"
                    >
                      {route.name}
                    </Text>
                    <Box
                      h="36px"
                      w="4px"
                      ml="auto"
                      bg={
                        activeRoute(route.path.toLowerCase())
                          ? brandColor
                          : 'transparent'
                      }
                      borderRadius="5px"
                    />
                  </>
                )}
              </Flex>
            </Box>
          </NavLink>
        );
      }
    });
  };
  //  BRAND
  return createLinks(routes);
}

export default SidebarLinks;