import React, { useState, useEffect } from 'react';
import devTeam from 'assets/img/Team.png';
import { Box } from '@chakra-ui/react';

// import SkeletonWithLoaders from 'components/common/Spinner';

// Teams UI
const Teams = () => {

  return (
        <>
          <h1>Teams UI Coming Soon</h1>
          <p>Stay tuned for updates!</p>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
          >
            <img src={devTeam} alt="" width={400} />
          </Box>
        </>
  );
};

export default Teams;
