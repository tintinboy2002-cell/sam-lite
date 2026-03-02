import React from 'react';
import { VStack } from '@chakra-ui/react';
import AnnouncementItem from './AnnouncementItem';

const NotificationLists = ({ notifications, onEdit, onDelete, isAdmin ,handleDownload }) => {
  return (
    <>
      <VStack spacing={4} align="stretch">
        {/* mapping each notification uniquely */}
        {Array.isArray(notifications) &&
          notifications
            .filter((n) => n !== undefined && n !== null) // remove bad items
            .map((notification) => (
              <AnnouncementItem
                key={notification.announcement_id}
                notification={notification}
                onEdit={onEdit}
                onDelete={onDelete}
                handleDownload={handleDownload}
                isAdmin={isAdmin}
              />
            ))}
      </VStack>
    </>
  );
};

export default NotificationLists;
