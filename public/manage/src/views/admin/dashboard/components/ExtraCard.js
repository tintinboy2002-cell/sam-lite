import { Button } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import httpInjectorService from 'services/http-injector.service';
import questionAmico from '../../../../assets/img/dashboards/Questions-amico.png';

// ---------- User Badge ----------
const UserBadge = ({ user, showWish, onWishClick, upcomingDate  }) => {
  const nameParts = user.username?.split(' ') || [];
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : user.username?.[0] || '?';

  const colors = [
    '#1abc9c',
    '#3498db',
    '#9b59b6',
    '#e67e22',
    '#e74c3c',
    '#2ecc71',
  ];
  const index =
    user.username
      ?.split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = user.color || colors[index];

  const formatDob = (dob) => {
    if (!dob) return '';
    const date = new Date(dob);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div
      className="d-flex flex-column align-items-center p-2"
      style={{ minWidth: '100px' }}
    >
      <div
        className="d-flex align-items-center justify-content-center text-white mb-2"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: bgColor,
          fontWeight: 'bold',
          fontSize: '16px',
        }}
      >
        {initials.toUpperCase()}
      </div>
      <div className="fw-semibold text-center">{user.username}</div>
      {showWish && (
        <div
          className="mt-1"
          style={{ color: 'purple', cursor: 'pointer', fontWeight: '500' }}
          onClick={() => onWishClick(user.email)}
        >
          Wish
        </div>
      )}

       {upcomingDate && (
        <div style={{ color: 'purple', cursor: 'pointer', fontWeight: '300' }}>
          {formatDob(user.dob)}
        </div>
      )}
    </div>
  );
};

// ---------- Extra Card ----------
function ExtraCard() {
  const [activeTab, setActiveTab] = useState(1);
  const [getBirthdays, setBirthdays] = useState([]);
  const [getAnniversary, setAnniversary] = useState([]);
  const [getNewJoiners, setNewJoiners] = useState([]);
  const [getUpcomingBirthdays, setUpcomingBirthdays] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [wishMessage, setWishMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getbirthdays = await httpInjectorService.getBirthDayList();
        if (getbirthdays.status === 'success') {
          setBirthdays(
            Array.isArray(getbirthdays.data?.today)
              ? getbirthdays.data.today
              : [],
          );
          setUpcomingBirthdays(
            Array.isArray(getbirthdays.data?.upcoming)
              ? getbirthdays.data.upcoming
              : [],
          );
        } else {
          setBirthdays([]);
          setUpcomingBirthdays([]);
        }

        const getAnniversary = await httpInjectorService.getWorkAnniversary();
        if (getAnniversary.status === 'success') {
          setAnniversary(getAnniversary.data);
        } else {
          setAnniversary([]);
        }

        const getNewJoiners = await httpInjectorService.getNewJoinersList();
        if (getNewJoiners.status === 'success') {
          setNewJoiners(getNewJoiners.data);
        } else {
          setNewJoiners([]);
        }
      } catch {
        setBirthdays([]);
        setAnniversary([]);
        setNewJoiners([]);
        setUpcomingBirthdays([]);
      }
    };
    fetchData();
  }, []);

  const handleSendWish = async () => {
    try {
      const reqBody = {
        receiver_email: selectedUser?.email,
        message: wishMessage,
      };
      const response = await httpInjectorService.sendBirthDayWish(reqBody);
      if (response.status === 'success') {
        setModalOpen(false);
        setSelectedUser('');
        setWishMessage('');
        toast.success('Birthday Wish Sent Successfully', {
          position: 'top-right',
          autoClose: 1000,
        });
      } else {
        setModalOpen(false);
        setSelectedUser('');
        setWishMessage('');
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
      }
    } catch (err) {
      setModalOpen(false);
      setSelectedUser('');
      setWishMessage('');
      toast.error(err, {
        position: 'top-right',
        autoClose: 1000,
      });
    }
  };

  const handleWishClick = (user) => {
    setSelectedUser(user);
    setWishMessage('');
    setModalOpen(true);
  };

  return (
    <div className="mt-3">
      <div className="shadow-md p-3 rounded bg-white">
        {/* Tabs Header */}
        <div className="relative border-bottom pb-2 mb-1">
          <div className="d-flex gap-4 position-relative">
            {[
              {
                id: 1,
                label: `🎂 ${
                  (Array.isArray(getBirthdays) ? getBirthdays.length : 0) +
                  (Array.isArray(getUpcomingBirthdays)
                    ? getUpcomingBirthdays.length
                    : 0)
                } Birthdays`,
              },
              {
                id: 2,
                label: `🎉 ${getAnniversary?.length} Work Anniversaries`,
              },
              { id: 3, label: `🧑‍🤝‍🧑 ${getNewJoiners?.length} New Joinees` },
            ].map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 fw-semibold transition-all`}
                style={{
                  fontSize: '14px',
                  color: activeTab === tab.id ? 'purple' : 'gray',
                  cursor: 'pointer',
                  position: 'relative',
                  userSelect: 'none',
                }}
              >
                {tab.label}
                {/* Active underline */}
                {activeTab === tab.id && (
                  <div
                    className="w-100"
                    style={{
                      position: 'absolute',
                      left: 0,
                      bottom: '-6px',
                      height: '3px',
                      borderRadius: '2px',
                      background: 'purple',
                      transition: 'all 0.3s ease',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-3 d-flex flex-wrap w-100">
          {activeTab === 1 && (
            <>
              {getBirthdays.length === 0 &&
              getUpcomingBirthdays.length === 0 ? (
                <div
                  className="d-flex justify-content-center align-items-center w-100"
                  style={{ minHeight: '200px' }}
                >
                  <img
                    src={questionAmico}
                    alt="No Birthdays"
                    style={{ width: '200px' }}
                  />
                </div>
              ) : (
                <>
                  {/* Today's Birthdays */}
                  {getBirthdays.length > 0 && (
                    <div className="w-100">
                      <span
                        style={{ color: 'purple' }}
                        className="card-title fw-bold d-block mb-2 justify-content-center"
                      >
                        Today's Birthdays
                      </span>
                      <div className="d-flex flex-wrap">
                        {getBirthdays.map((user, i) => (
                          <UserBadge
                            key={i}
                            user={user}
                            showWish
                            onWishClick={() => handleWishClick(user)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upcoming Birthdays */}
                  {getUpcomingBirthdays.length > 0 && (
                    <div className="w-100 mt-3">
                      <span
                        style={{ color: 'purple' }}
                        className="card-title fw-bold d-block mb-2"
                      >
                        Upcoming Birthdays
                      </span>
                      <div className="d-flex flex-wrap">
                        {getUpcomingBirthdays.map((user, i) => (
                          <UserBadge key={i} user={user} upcomingDate />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {activeTab === 2 &&
            (getAnniversary.length > 0 ? (
              getAnniversary.map((user, i) => <UserBadge key={i} user={user} />)
            ) : (
              <div
                className="d-flex justify-content-center align-items-center w-100"
                style={{ minHeight: '200px' }}
              >
                <img
                  src={questionAmico}
                  alt="No Anniversaries"
                  style={{ width: '200px' }}
                />
              </div>
            ))}

          {activeTab === 3 &&
            (getNewJoiners.length > 0 ? (
              getNewJoiners.map((user, i) => <UserBadge key={i} user={user} />)
            ) : (
              <div
                className="d-flex justify-content-center align-items-center w-100"
                style={{ minHeight: '200px' }}
              >
                <img
                  src={questionAmico}
                  alt="No New Joinees"
                  style={{ width: '200px' }}
                />
              </div>
            ))}
        </div>
      </div>

      {/* Wish Modal */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
          Send Wish To {selectedUser?.username}
        </ModalHeader>
        <ModalBody>
          <Input
            type="textarea"
            rows="4"
            placeholder="Type your message..."
            value={wishMessage}
            onChange={(e) => setWishMessage(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            size="sm"
            rounded="3"
            colorScheme="red"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            rounded="3"
            colorScheme="purple"
            onClick={handleSendWish}
          >
            Send
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default ExtraCard;
