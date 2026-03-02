import React from 'react';
import { Row, Col, Card, CardBody, CardImg, CardFooter } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import dashboardData from './tableDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <React.Fragment>
      <div className="page-content" style={{ marginTop: '80px', }} >
        <Row>
          {dashboardData.map((item) => (
            <Col className="mt-5" key={item.id} md={3}>
              <div
                style={{
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
                onClick={() => handleCardClick(item.path)}
              >
                <Card className="card-box hover-card">
                  <CardBody className="d-flex justify-content-center align-items-center">
                    <CardImg
                      top
                      className="img-fluid hover-image"
                      src={item.image}
                      alt={item.className}
                    />
                  </CardBody>
                  <CardFooter className="card-footer">{item.name}</CardFooter>
                </Card>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
