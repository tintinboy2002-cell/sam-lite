import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import inboxImg from '../../../../assets/img/dashboards/Thoughts-pana.png';
import httpInjectorService from 'services/http-injector.service';

function InboxCard() {
  const [quotes, setQuotes] = useState([]);

  const getDailyThoughts = async () => {
    try {
      const response = await httpInjectorService.getDailyThoughts();
      if (response.status === 'success') {
        setQuotes(response.data.thought);
      } else {
        setQuotes([]);
      }
    } catch {
      setQuotes([]);
    }
  };

  useEffect(() => {
    getDailyThoughts();
  }, []);

  return (
    <div className="mt-3">
      <div className="shadow-md p-3 rounded bg-white">
        <div className="row">
          <span className="card-title fw-bold">Thoughts</span>
          <div className="col-6 d-flex justify-content-center">
            <img
              src={inboxImg}
              alt="Inbox"
              style={{ height: 100, width: 100 }}
            />
          </div>
          <div className="col-6">
            <p className="card-text mt-3">
              Good Thought !<br />
              {quotes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

InboxCard.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
};

export default InboxCard;
