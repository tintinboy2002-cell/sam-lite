import React, { useState } from 'react';
import Cookies from 'js-cookie';
import rawOperationData from './OperationTables'; // unfiltered list
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, CardBody } from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { decryptData } from 'utils/crypto';
import SkeletonWithLoaders from 'components/common/Spinner';

const Operations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Get roleId from cookie
  const roleIdRaw = decryptData(Cookies.get('role_id'));
  const roleId = roleIdRaw ? parseInt(roleIdRaw) : null;

  // Filter data by role
  const roleFilteredData = rawOperationData.filter((item) => {
    return item.label !== 'Work Week' || [1, 2].includes(roleId);
  });

  // Filter by search
  const filteredOperations = roleFilteredData.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOnClick = (path) => {
    navigate(path);
  };

  return (
    <SkeletonWithLoaders>
      <div style={{ marginTop: '80px' }}>
        {/* Search Bar */}
        <div className="row mb-5 justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="input-group shadow-sm rounded-1 border">
              <span className="input-group-text bg-transparent border-0 ps-3">
                <FaSearch className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-0 rounded-1"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row justify-content-start">
            {filteredOperations.map((item, index) => (
              <div
                key={index}
                className="col-6 col-sm-4 col-md-3 col-lg-2 d-flex justify-content-center mb-4"
              >
                <div
                  className="card border-0 shadow-sm text-center transition d-flex flex-column align-items-center justify-content-center"
                  style={{
                    width: '100%', // take full width of grid column
                    maxWidth: '160px', // but don’t grow too large
                    height: '160px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease-in-out',
                  }}
                  onClick={() => handleOnClick(item.path)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow =
                      '0 6px 16px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow =
                      '0 2px 5px rgba(0,0,0,0.1)';
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: '#f4e6fa',
                      color: '#884B9E',
                      fontSize: '26px',
                    }}
                  >
                    {item.icon}
                  </div>
                  <p className="mb-0 fw-semibold small text-truncate">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonWithLoaders>
  );
};

export default Operations;
