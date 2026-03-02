import React from 'react';

// Chakra imports
import { Flex, useColorModeValue } from '@chakra-ui/react';

// Custom components
import { HorizonLogo } from 'components/icons/Icons';
import { HSeparator } from 'components/separator/Separator';

export function SidebarBrand(props) {
  //   Chakra color mode
  let logoColor = useColorModeValue('navy.700', 'white');

  const { isCollapsed } = props;

  return (
    <Flex align="center" direction="column">
      {!isCollapsed && (
        <HorizonLogo h="26px" w="175px" my="32px" color={logoColor} />
      )}
      <HSeparator mb="20px" />
    </Flex>
  );
}

export default SidebarBrand;