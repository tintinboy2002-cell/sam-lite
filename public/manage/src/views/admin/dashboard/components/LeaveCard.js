import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import httpInjectorService from 'services/http-injector.service';
import noLeaveImg from '../../../../assets/img/dashboards/Typing-bro.png';
import onLeaveImg from '../../../../assets/img/dashboards/nature-pana.png';

// ---------- Leave List ----------
const LeaveList = ({ members, fallback }) => {
  const [expanded, setExpanded] = useState(false);
  const limit = 3;

  if (members?.length > 0) {
    const visibleMembers = expanded ? members : members.slice(0, limit);

    return (
      <div className="mt-2">
        <div className="d-flex flex-wrap gap-2">
          {visibleMembers.map((m) => (
            <span
              key={m.id || m.name}
              className="badge text-white p-2"
              style={{
                fontSize: '0.8rem',
                borderRadius: '12px',
                backgroundColor: 'purple',
              }}
            >
              {m.name}
            </span>
          ))}

          {members.length > limit && (
            <button
              type="button"
              className="badge bg-light text-dark border p-2"
              style={{
                fontSize: '0.8rem',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? 'Show less' : `+${members.length - limit} more`}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <p className="card-text mt-3">
      {fallback.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          <br />
        </React.Fragment>
      ))}
    </p>
  );
};

LeaveList.propTypes = {
  members: PropTypes.array,
  fallback: PropTypes.string.isRequired,
};

// ---------- Leave Card ----------
function LeaveCard() {
  const [leaveMembers, setLeaveMembers] = useState([]);
  const [image, setImage] = useState(noLeaveImg);
  const [content, setContent] = useState(
    'Everyone is working today !\nNo one is on leave today.',
  );

  const getTodaysLeaveMembers = useCallback(async () => {
    try {
      const response = await httpInjectorService.getTodaysLeaveMembers();
      const data = response.status === 'success' ? response.data : [];

      setLeaveMembers(data);
      setImage(data.length > 0 ? onLeaveImg : noLeaveImg);
      setContent(
        data.length === 0
          ? 'Everyone is working today!\nNo one is on leave today.'
          : null,
      );
    } catch (err) {
      console.error('Failed to fetch leave members', err);
    }
  }, []);

  useEffect(() => {
    getTodaysLeaveMembers();
  }, [getTodaysLeaveMembers]);

  return (
    <div className="mt-3">
      <div className="shadow-md p-3 rounded bg-white">
        <div className="row">
          <span className="card-title fw-bold">On Leave Today</span>
          <div className="col-6">
            <LeaveList members={leaveMembers} fallback={content} />
          </div>
          <div className="col-6 d-flex justify-content-center">
            <img src={image} alt="On Leave" style={{ height: 100, width: 100 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

LeaveCard.propTypes = {
  leaveMembers: PropTypes.array,
  content: PropTypes.string,
};

export default LeaveCard;
