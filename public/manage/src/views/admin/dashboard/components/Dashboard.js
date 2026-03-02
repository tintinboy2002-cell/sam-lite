import React from 'react';
import InboxCard from './InboxCard';
import HolidaysCard from './HolidaysCard';
import LeaveCard from './LeaveCard';
import RemoteCard from './RemoteCard';
import ExtraCard from './ExtraCard';

import SkeletonWithLoaders from 'components/common/Spinner';

function Dashboard() {

  return (
    <SkeletonWithLoaders>
    <div className="mt-5">
      <div className="row">
        {/* Left Column */}
        <div className="col-md-5">
          <InboxCard />
          <HolidaysCard />
          <LeaveCard />
          <RemoteCard />
        </div>

        {/* Right Column */}
        <div className="col-md-7">
          <ExtraCard />
        </div>
      </div>
    </div>
    </SkeletonWithLoaders>
  );
}

export default Dashboard;