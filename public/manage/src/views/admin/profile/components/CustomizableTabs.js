import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  IconButton,
  Flex,
  Text,
  Switch,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  useDisclosure,
} from '@chakra-ui/react';
import { GiSettingsKnobs } from 'react-icons/gi';
import { FaLock } from 'react-icons/fa';
import { Card } from 'reactstrap';

const STORAGE_KEY = 'dashboardTabSettings';

const CustomizableTabs = ({ tabsConfig, componentsMap }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [config, setConfig] = useState(tabsConfig);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const merged = tabsConfig.map((tab) => ({
          ...tab,
          isEnabled:
            parsed.find((p) => p.key === tab.key)?.isEnabled ?? tab.isEnabled,
        }));
        setConfig(merged);
      } catch (e) {
        console.error('Invalid tab config in localStorage');
      }
    }
  }, [tabsConfig]);

  // Save settings to localStorage when config changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const handleToggleTab = (key) => {
    setConfig((prev) =>
      prev.map((tab) =>
        tab.key === key ? { ...tab, isEnabled: !tab.isEnabled } : tab,
      ),
    );
  };

  // Only include enabled tabs
  const enabledTabs = config.filter((tab) => tab.isEnabled);

  return (
    <Box>
      <Tabs
        index={selectedIndex}
        onChange={setSelectedIndex}
        variant="unstyled"
        isLazy
        width="full"
        >
        <Flex direction="row" align="center" mb={2} gap={2}>
        <Card>
            <Box
              overflowX="auto"
              whiteSpace="nowrap"
              flex="1"
              width="100%"
              px={2}
              py={2}
              css={{
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                '-ms-overflow-style': 'none',
                'scrollbar-width': 'none',
              }}
            >
              <TabList width="full">
                {enabledTabs.map((tab) => (
                  <Tab
                    key={tab.key}
                    fontWeight="medium"
                    mx={1}
                    px={4}
                    py={2}
                    width="auto"
                    borderBottom="2px solid transparent"
                    _selected={{
                      // borderBottom: '2px solid #3182CE',
                      backgroundColor: 'purple.500',
                      color: 'white',
                      borderRadius: 'lg',
                      fontWeight: 'bold',
                    }}
                    _hover={{
                      borderBottom: '2px solid #CBD5E0',
                    }}
                    flexShrink={0}
                  >
                    {tab.label}
                  </Tab>
                ))}
              </TabList>
            </Box>

          </Card>
        </Flex>

        <TabPanels mt={2} bg="white" borderRadius="md" boxShadow="sm">
          {enabledTabs.map((tab) => (
            <TabPanel key={tab.key}>
              {componentsMap[tab.key] || <Text>Component Missing</Text>}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default CustomizableTabs;