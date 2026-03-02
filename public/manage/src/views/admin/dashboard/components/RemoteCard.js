import React from 'react';
import wfhImg from '../../../../assets/img/dashboards/office-amico.png';

function RemoteCard() {
  return (
    <div className="mt-3">
      <div className="shadow-md p-3 rounded bg-white">
        <div className="row">
          <span className="card-title fw-bold">Working Remotely</span>
          <div className="col-6">
            <p className="card-text mt-3">
              Everyone is at office !<br />
              No one is working remotely today.
            </p>
          </div>
          <div className="col-6 d-flex justify-content-center">
            <img src={wfhImg} alt="Remote Work" style={{ height: 100, width: 100 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RemoteCard;
