import React, { useState } from 'react';

// chakra imports
import {
  Box,
  Flex,
  Drawer,
  DrawerBody,
  Icon,
  useColorModeValue,
  DrawerOverlay,
  useDisclosure,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Text,
  Button,
} from '@chakra-ui/react';
import Content from 'components/sidebar/components/Content';
import {
  renderThumb,
  renderTrack,
  renderView,
} from 'components/scrollbar/Scrollbar';
import { Scrollbars } from 'react-custom-scrollbars-2';
import PropTypes from 'prop-types';

// Assets
import { IoMenuOutline } from 'react-icons/io5';

function Sidebar(props) {
  const { routes } = props;
  const { isCollapsed } = props;

  let variantChange = '0.2s linear';
  let shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    'unset',
  );

  // Set sidebar background to very light purple
  let sidebarBg = useColorModeValue('#E1D1F4', 'navy.800'); // Light purple for light mode
  let sidebarMargins = '0px';

  // SIDEBAR
  return (
    <Box display={{ sm: 'none', xl: 'block' }} position="fixed" minH="100%">
      <Box
        bg={sidebarBg}
        transition={variantChange}
        // w={isCollapsed ? '60px' : '250px'} // Adjust width dynamically
        w={'80px'} // Adjust width dynamically
        h="100vh"
        minH="100%"
        mt="0px" //added margin top for navbar
        overflowX="hidden"
        boxShadow={shadow}
        // borderRadius="15px"
        // p={isCollapsed ? 2 : 4} // Reduce padding when collapsed
        display="flex"
        flexDirection="column"
        // alignItems={isCollapsed ? 'center' : 'flex-start'} // Center icons when collapsed
      >
        {/* <Scrollbars
          autoHide
          renderTrackVertical={renderTrack}
          renderThumbVertical={renderThumb}
          renderView={renderView}
        > */}
          <Content routes={routes} isCollapsed={isCollapsed} />
        {/* </Scrollbars> */}
      </Box>
    </Box>
  );
}

// FUNCTIONS
export function SidebarResponsive(props) {
  let sidebarBackgroundColor = useColorModeValue('#F3E5F5', 'navy.800'); // Light purple for light mode
  let menuColor = useColorModeValue('gray.400', 'white');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  const { routes } = props;

  return (
    <Flex display={{ sm: 'flex', xl: 'none' }} alignItems="center">
      <Flex ref={btnRef} w="max-content" h="max-content" onClick={onOpen}>
        <Icon
          as={IoMenuOutline}
          color={menuColor}
          my="auto"
          w="20px"
          h="20px"
          me="10px"
          _hover={{ cursor: 'pointer' }}
        />
      </Flex>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement={document.documentElement.dir === 'rtl' ? 'right' : 'left'}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent w="285px" maxW="285px" bg={sidebarBackgroundColor}>
          <DrawerCloseButton
            zIndex="3"
            onClose={onClose}
            _focus={{ boxShadow: 'none' }}
            _hover={{ boxShadow: 'none' }}
          />
          <DrawerBody maxW="285px" px="0rem" pb="0">
            <Scrollbars
              autoHide
              renderTrackVertical={renderTrack}
              renderThumbVertical={renderThumb}
              renderView={renderView}
            >
              <Content routes={routes} onClose={onClose}/>
            </Scrollbars>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}

// PROPS
Sidebar.propTypes = {
  logoText: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
  variant: PropTypes.string,
};

export default Sidebar;