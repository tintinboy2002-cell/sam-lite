import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Avatar,
  Flex,
  Text,
  useColorModeValue,
  Button,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Input,
  Toast,
  Card,
  CardBody,
} from 'reactstrap';
import classnames from 'classnames';
import userimage from '../../../assets/img/auth/Default_profileoic.jpg';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { setprofiledata } from 'store/actions';
import AssignedWork from '../employeeProfile/AssignedWork';
import EmployeeDoc from './EmployeeDoc';
import Spinner from 'components/common/Spinner';
import OffBoarding from './OffBoarding';
import EmployeeBankdetails from './EmployeeBankDetails';
import { setUsername } from 'store/actions';


const Personal = ({
  isEditingPersonal,
  setIsEditingPersonal,
  setIsEditingContact,
  disableContact,
  saveData,
  disable,
  isEditingContact,
  validatePhoneNumber,
  validateEmail,
  formData,
  handleChange,
  handleDateChange,
  formErrors,
  inputRef,
  handleImageChange,
  handleImageclick,
  image,
  inputErrors,
}) => {

  return (
    <React.Fragment>

        <>
          <Card
            className="shadow p-1 bg-white mb-3"
            style={{ marginTop: '20px' }}
          >
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Personal Info</h5>
              {!isEditingPersonal && (
                <Button
                  colorScheme="purple"
                  onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                >
                  edit
                </Button>
              )}
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-8">
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: 'bold',
                        }}
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={!isEditingPersonal}
                        className="form-control"
                        placeholder="Enter your name"
                        style={{
                          border: 'none',
                          width: '100%',
                          backgroundColor: isEditingPersonal ? '' : '#fff',
                          padding: '2px',
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: 'bold',
                        }}
                      >
                        Blood Group
                      </label>
                      <input
                        type="text"
                        name="blood_group"
                        value={formData.blood_group}
                        onChange={handleChange}
                        disabled={!isEditingPersonal}
                        className="form-control"
                        placeholder="Enter your blood group"
                        style={{
                          border: 'none',
                          width: '100%',
                          backgroundColor: isEditingPersonal ? '' : '#fff',
                          padding: '2px',
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-4 mb-3">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: 'bold',
                        }}
                      >
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        disabled={!isEditingPersonal}
                        className="form-control"
                        style={{
                          border: 'none',
                          width: '100%',
                          backgroundColor: isEditingPersonal ? '' : '#fff',
                          padding: '2px',
                        }}
                      >
                        {' '}
                        <option value="">Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-4 mb-3">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: 'bold',
                        }}
                      >
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={(e) => {
                          handleChange(e);
                          handleDateChange(e);
                        }}
                        disabled={!isEditingPersonal}
                        className="form-control"
                        style={{
                          border: 'none',
                          width: '100%',
                          backgroundColor: isEditingPersonal ? '' : '#fff',
                          padding: '2px',
                        }}
                      />
                      {formErrors.dob && (
                        <div style={{ color: 'red', marginTop: '5px' }}>
                          {formErrors.dob}
                        </div>
                      )}
                    </div>
                    <div className="col-4 mb-3">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: 'bold',
                        }}
                      >
                        Marital Status
                      </label>
                      <select
                        name="marital_status"
                        value={formData.marital_status}
                        onChange={handleChange}
                        disabled={!isEditingPersonal}
                        className="form-control"
                        style={{
                          border: 'none',
                          width: '100%',
                          backgroundColor: isEditingPersonal ? '' : '#fff',
                          padding: '2px',
                        }}
                      >
                        {' '}
                        <option value="">Marital Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-4 d-flex flex-column justify-content-center align-items-center">
                  <div>
                    {image ? (
                      <img
                        src={image}
                        alt="Selected"
                        style={{
                          width: '180px',
                          height: '180px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <img
                        src={userimage}
                        alt="Default"
                        style={{
                          width: '180px',
                          height: '180px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                    <input
                      type="file"
                      ref={inputRef}
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      accept="image/*"
                    />
                  </div>
                  <div className="text-center ms-8  mt-1">
                    <div className="text-center ms-8  mt-1">
                      {isEditingPersonal && (
                        <div onClick={handleImageclick}>
                          <h5>
                            <i className="bx bx-edit-alt icon" />
                            Edit
                          </h5>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {isEditingPersonal && (
                  <div
                    className="row"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <div className="col-4">
                      <Button
                        colorScheme="purple"
                        onClick={() => {
                          saveData();
                          setIsEditingPersonal(!isEditingPersonal);
                        }}
                        disabled={disable}
                      >
                        save
                      </Button>
                      <button
                        className="btn btn-secondary"
                        style={{ marginLeft: '10px' }}
                        onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                      >
                        cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card
            className="shadow p-1 bg-white mb-3"
            style={{ marginTop: '20px' }}
          >
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Contact Info</h5>
              {!isEditingContact && (
                <Button
                  colorScheme="purple"
                  onClick={() => setIsEditingContact(!isEditingContact)}
                >
                  edit
                </Button>
              )}
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-6 mb-3">
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontWeight: 'bold',
                    }}
                  >
                    Official Email ID
                  </label>
                  <input
                    type="email"
                    name="official_email_id"
                    value={formData.official_email_id}
                    onChange={(e) => {
                      validateEmail(e);
                      handleChange(e);
                    }}
                    disabled={!isEditingContact}
                    className="form-control"
                    placeholder="Enter your official email"
                    style={{
                      border: 'none',
                      width: '100%',
                      backgroundColor: isEditingContact ? '' : '#fff',
                      padding: '2px',
                    }}
                  />
                  {inputErrors.official_email_id && (
                    <div style={{ color: 'red', marginTop: '5px' }}>
                      {inputErrors.official_email_id}
                    </div>
                  )}
                </div>
                <div className="col-6 mb-3">
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontWeight: 'bold',
                    }}
                  >
                    Personal Email ID
                  </label>
                  <input
                    type="email"
                    name="personal_email_id"
                    value={formData.personal_email_id}
                    onChange={(e) => {
                      validateEmail(e);
                      handleChange(e);
                    }}
                    disabled={!isEditingContact}
                    className="form-control"
                    placeholder="Enter your personal email"
                    style={{
                      border: 'none',
                      width: '100%',
                      backgroundColor: isEditingContact ? '' : '#fff',
                      padding: '2px',
                    }}
                  />
                  {inputErrors.personal_email_id && (
                    <div style={{ color: 'red', marginTop: '5px' }}>
                      {inputErrors.personal_email_id}
                    </div>
                  )}
                </div>
              </div>
              <div className="row">
                <div className="col-6 mb-3">
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontWeight: 'bold',
                    }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => {
                      validatePhoneNumber(e);
                      handleChange(e);
                    }}
                    disabled={!isEditingContact}
                    className="form-control"
                    placeholder="Enter your phone number"
                    style={{
                      border: 'none',
                      width: '100%',
                      backgroundColor: isEditingContact ? '' : '#fff',
                      padding: '2px',
                    }}
                  />
                  {inputErrors.phone_number && (
                    <div style={{ color: 'red', marginTop: '5px' }}>
                      {inputErrors.phone_number}
                    </div>
                  )}
                </div>
                <div className="col-6 mb-3">
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontWeight: 'bold',
                    }}
                  >
                    Alternate Phone Number
                  </label>
                  <input
                    type="tel"
                    name="alternate_phone_number"
                    value={formData.alternate_phone_number}
                    onChange={(e) => {
                      validatePhoneNumber(e);
                      handleChange(e);
                    }}
                    disabled={!isEditingContact}
                    className="form-control"
                    placeholder="Enter your alternate phone number"
                    style={{
                      border: 'none',
                      width: '100%',
                      backgroundColor: isEditingContact ? '' : '#fff',
                      padding: '2px',
                    }}
                  />
                  {inputErrors.alternate_phone_number && (
                    <div style={{ color: 'red', marginTop: '5px' }}>
                      {inputErrors.alternate_phone_number}
                    </div>
                  )}
                </div>
              </div>
              <div className="row">
                <div className="col-6 mb-3">
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontWeight: 'bold',
                    }}
                  >
                    Current Address
                  </label>
                  <textarea
                    name="current_address"
                    value={formData.current_address}
                    onChange={handleChange}
                    disabled={!isEditingContact}
                    className="form-control"
                    placeholder="Enter your current address"
                    style={{
                      border: 'none',
                      width: '100%',
                      backgroundColor: isEditingContact ? '' : '#fff',
                      padding: '2px',
                    }}
                  />
                </div>
                <div className="col-6 mb-3">
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontWeight: 'bold',
                    }}
                  >
                    Permanent Address
                  </label>
                  <textarea
                    name="permanent_address"
                    value={formData.permanent_address}
                    onChange={handleChange}
                    disabled={!isEditingContact}
                    className="form-control"
                    placeholder="Enter your permanent address"
                    style={{
                      border: 'none',
                      width: '100%',
                      backgroundColor: isEditingContact ? '' : '#fff',
                      padding: '2px',
                    }}
                  />
                </div>
                {isEditingContact && (
                  <div
                    className="row"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <div className="col-4">
                      <Button
                        colorScheme="purple"
                        onClick={() => {
                          saveData();
                          setIsEditingContact(!isEditingContact);
                        }}
                        disabled={disableContact}
                      >
                        save
                      </Button>
                      <button
                        className="btn btn-secondary"
                        style={{ marginLeft: '10px' }}
                        onClick={() => setIsEditingContact(!isEditingContact)}
                      >
                        cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </>

    </React.Fragment>
  );
};

export default Personal;
