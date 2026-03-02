import React from "react";
import { Badge, CloseButton, HStack } from '@chakra-ui/react';


export const FeatureName = ({ value }) => {
    return <span>{value || ''}</span>
}

export const Description = ({ value }) => {
    return <span>{value || ''}</span>
}


export const OrgName = ({ row, assignedFeatureOrg, onUnassign }) => {
  const featureId = row.original.feature_id;

  const orgsForFeature = assignedFeatureOrg.filter(
    (item) => item.feature_id === featureId
  );

  return (
    <HStack spacing={2} wrap="wrap">
      {orgsForFeature.map((org) => (
        <Badge
          key={org.id}
          colorScheme="purple"
          px={2}
          py={1}
          borderRadius="md"
          display="flex"
          alignItems="center"
          gap={1}
        >
          {org.org_name}
          <CloseButton
            size="sm"
            onClick={() => onUnassign(featureId, org.id)}
          />
        </Badge>
      ))}
    </HStack>
  );
};

