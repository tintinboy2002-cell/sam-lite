import React from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  HStack,
  IconButton,
  Badge,
  Flex,
  Tooltip,
  Card
} from '@chakra-ui/react';
import { Edit2, Trash2 } from 'lucide-react';
import { Paperclip } from 'lucide-react';

const AnnouncementItem = ({ notification, onEdit, onDelete, isAdmin , handleDownload }) => {
  if (!notification) return null; // <-- prevent crash
  return (
    <Card
      id={notification.announcement_id}
      borderLeftWidth="4px"
      borderRadius="lg"
      shadow="sm"
      position="relative"
      // border="2px"
      // borderColor={notification.status === 'Active' ? 'green.600' : 'red.600'}
      // backgroundColor={notification.status === 'Active' ? 'green.100' : 'red.100'}
      p={6}
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="flex-start">
        <Box flex="1" mt={{base : "5" , md : "0"}}>
          {/* Title */}
          <Heading size="lg" color="gray.800" mb={2}>
            {notification.title} 
          </Heading>

          {/* Message */}
          <Text
            color="gray.700"
            lineHeight="relaxed"
            whiteSpace="pre-wrap"
            mb={3}
          >
            {notification.message}
          </Text>

          {/* Metadata Row */}
          <HStack spacing={4} flexWrap="wrap" fontSize="sm" color="gray.500">
            {/* Created By */}
            {notification.created_by && (
              <>
                <Text>Created By- <b>{notification.created_by}</b></Text>
              </>
            )}

            {/* Status */}
            {notification.status && (
              <>
                <Text>•</Text>
                <Badge 
                backgroundColor={notification.status === 'Active' ? 'green.600' : 'red.600'} 
                color="white"
                fontSize="xs"> {notification.status}</Badge>
              </>
            )}

            {/* Attachment indicator */}
            {notification.attachment && notification.attachment.length > 0 && (
              <>
                <Text>•</Text>
                <Badge colorScheme="purple" fontSize="xs">
                  📎 Attachment
                </Badge>
              </>
            )}
          </HStack>

          {/* Date Range (if present) */}
          {(notification.start_date || notification.end_date) && (
            <HStack spacing={4} mt={3} fontSize="sm">
              {notification.start_date && (
                <Text color="gray.600">
                  <Text as="span" fontWeight="semibold">
                    Start:
                  </Text>{' '}
                  {new Date(notification.start_date).toLocaleDateString()}
                </Text>
              )}
              {notification.end_date && (
                <Text color="gray.600">
                  <Text as="span" fontWeight="semibold">
                    End:
                  </Text>{' '}
                  {new Date(notification.end_date).toLocaleDateString()}
                </Text>
              )}
            </HStack>
          )}

          {/* attachment UI */}
          <Box mt={2}>
            <Text fontWeight="bold" mb={1}>
              Attachment:
            </Text>

            {notification.attachment_url ? (
              <Box
                p={2}
                bg="blue.50"
                borderRadius="md"
                border="1px solid"
                borderColor="blue.200"
                width="fit-content"
              >
                <HStack display="flex" alignItems="center" justifyContent="flex-start" gap="4">
                  <Paperclip />
                  
                  <Text fontSize="sm" fontWeight="medium" color="blue.700" alignItems="center">
                    {notification.attachment_url}
                  </Text>

                  <Button
                    size="xs"
                    colorScheme="blue"
                    variant="outline"
                    onClick={() =>
                      handleDownload(notification.announcement_id,notification.attachment_url)
                    }
                  >
                    Download
                  </Button>
                </HStack>
              </Box>
            ) : (
              <Text color="gray.500" fontSize="sm">
                No attachments
              </Text>
            )}
          </Box>

        </Box>

        {/* Admin Actions */}
        {isAdmin && (
          <HStack position={{base:"absolute" , md:"unset"}} right={{base : "0.5"}} top={{base : "0.5"}} spacing={2} ml={0} borderRadius="2xl" border="2px solid" backgroundColor="gray.100" borderColor="gray.200" p={1}>
            <Tooltip label="Edit" hasArrow>
              <IconButton
                icon={<Edit2 size={18} />}
                onClick={() => onEdit(notification)}
                colorScheme="blue"
                variant="ghost"
                size="sm"
                aria-label="Edit announcement"
              />
            </Tooltip>
            <Tooltip label="Delete" hasArrow>
              <IconButton
                icon={<Trash2 size={18} />}
                onClick={() => onDelete(notification.announcement_id)}
                colorScheme="red"
                variant="ghost"
                size="sm"
                aria-label="Delete announcement"
              />
            </Tooltip>
          </HStack>
        )}
      </Flex>
    </Card>
  );
};

export default AnnouncementItem;