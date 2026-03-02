// chakra imports
import { Box, Flex, Stack } from "@chakra-ui/react";
//   Custom components
import Brand from "components/sidebar/components/Brand";
import Links from "components/sidebar/components/Links";
import SidebarCard from "components/sidebar/components/SidebarCard";
import React, { useEffect, useState } from "react";

// FUNCTIONS

function SidebarContent(props) {
  // const { routes } = props;
  // const { isCollapsed } = props

  const { routes, isCollapsed, onClose } = props;

  // SIDEBAR
  return (
    // padding top set to 0px to align with navbar
    <Flex direction='column' height='100%' pt='0px' mr={{ base: "0", "2xl": "5" }} borderRadius='30px'>
      <Brand isCollapsed={isCollapsed} />
      <Stack direction='column' mb='auto' mt='0px'>
        <Box pe={{ md: "16px", "2xl": "1px" }}>
          <Links isCollapsed={isCollapsed} routes={routes} onClose={onClose}/>
        </Box>
      </Stack>

      <Box
        mt='60px'
        mb='40px'
        borderRadius='30px'>
        <SidebarCard />
      </Box>
    </Flex>
  );
}

export default SidebarContent;