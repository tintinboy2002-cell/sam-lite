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
import Personal from './Personal';

const Work = ({
  isEditingBasicInfo,
  setIsEditingBasicInfo,
  roleId,
  formData,
  handleChange,
  saveData,
  isEditingWorkInfo,
  setIsEditingWorkInfo,
  departments,
  setFormData,
  subDepartments,
  designations,
}) => {
  return (
    <React.Fragment>
      <Card className="shadow p-1 bg-white mb-3" style={{ marginTop: '20px' }}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>Basic Info</h5>
          {!isEditingBasicInfo && roleId === 2 && (
            <Button
              colorScheme="purple"
              onClick={() => setIsEditingBasicInfo(!isEditingBasicInfo)}
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
                Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className="form-control"
                disabled
                style={{
                  border: 'none',
                  width: '100%',
                  backgroundColor: isEditingBasicInfo ? '' : '#fff',
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
                Date of Joining
              </label>
              <input
                type="date"
                name="date_of_joining"
                value={formData.date_of_joining}
                onChange={handleChange}
                className="form-control"
                disabled={!isEditingBasicInfo}
                style={{
                  border: 'none',
                  width: '100%',
                  backgroundColor: isEditingBasicInfo ? '' : '#fff',
                  padding: '2px',
                }}
              />
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
                Probation Period (in days)
              </label>
              <input
                type="number"
                name="probation_period"
                value={formData.probation_period}
                onChange={handleChange}
                className="form-control"
                disabled={!isEditingBasicInfo}
                style={{
                  border: 'none',
                  width: '100%',
                  backgroundColor: isEditingBasicInfo ? '' : '#fff',
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
                Employee Type
              </label>
              <select
                name="employee_type"
                value={formData.employee_type}
                onChange={handleChange}
                className="form-control"
                disabled={!isEditingBasicInfo}
                style={{
                  border: 'none',
                  width: '100%',
                  backgroundColor: isEditingBasicInfo ? '' : '#fff',
                  padding: '2px',
                }}
              >
                <option>select</option>
                <option>intern</option>
                <option>full-time</option>
              </select>
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
                Work Location
              </label>
              <input
                type="text"
                name="work_location"
                value={formData.work_location}
                onChange={handleChange}
                className="form-control"
                disabled={!isEditingBasicInfo}
                style={{
                  border: 'none',
                  width: '100%',
                  backgroundColor: isEditingBasicInfo ? '' : '#fff',
                  padding: '2px',
                }}
              />
            </div>
            {isEditingBasicInfo && (
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
                      setIsEditingBasicInfo(!isEditingBasicInfo);
                    }}
                  >
                    save
                  </Button>
                  <button
                    className="btn btn-secondary"
                    style={{ marginLeft: '10px' }}
                    onClick={() => setIsEditingBasicInfo(!isEditingBasicInfo)}
                  >
                    cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="shadow p-1 bg-white mb-3" style={{ marginTop: '20px' }}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>Work Info</h5>
          {!isEditingWorkInfo && roleId === 2 && (
            <Button
              colorScheme="purple"
              onClick={() => setIsEditingWorkInfo(!isEditingWorkInfo)}
            >
              edit
            </Button>
          )}
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-6 mb-3">
              <label className="col-form-label">
                Department<span className="text-danger">*</span>
              </label>
              <Input
                type="select"
                name="department"
                value={formData.department}
                disabled={!isEditingWorkInfo}
                onChange={(e) => {
                  const selectedDept = departments.find(
                    (dept) => dept.department_name === e.target.value,
                  );
                  setFormData((prevState) => ({
                    ...prevState,
                    department: selectedDept
                      ? selectedDept.department_name
                      : '',
                    departmentId: selectedDept
                      ? selectedDept.department_id
                      : '',
                  }));
                }}
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_name}>
                    {dept.department_name}
                  </option>
                ))}
              </Input>
            </div>

            <div className="col-6 mb-3">
              <label className="col-form-label">
                SubDepartment<span className="text-danger">*</span>
              </label>
              <Input
                type="select"
                name="subDepartment"
                value={formData.subDepartment}
                disabled={!isEditingWorkInfo}
                onChange={(e) => {
                  const selectedSubDept = subDepartments.find(
                    (subDept) => subDept.subdepartment === e.target.value,
                  );
                  setFormData((prevState) => ({
                    ...prevState,
                    subDepartment: selectedSubDept
                      ? selectedSubDept.subdepartment
                      : '',
                    subDepartmentId: selectedSubDept
                      ? selectedSubDept.subdepartment_id
                      : '',
                  }));
                }}
              >
                <option value="">Select subdepartment</option>
                {subDepartments.length > 0 &&
                  subDepartments.map((subDept) => (
                    <option
                      key={subDept.subdepartment_id}
                      value={subDept.subdepartment}
                    >
                      {subDept.subdepartment}
                    </option>
                  ))}
              </Input>
            </div>

            <div className="col-6 mb-3">
              <label className="col-form-label">
                Designation<span className="text-danger">*</span>
              </label>
              <Input
                type="select"
                name="designation"
                value={formData.designation}
                disabled={!isEditingWorkInfo}
                onChange={(e) => {
                  const selectedDesignation = designations.find(
                    (designation) =>
                      designation.designations === e.target.value,
                  );
                  setFormData((prevState) => ({
                    ...prevState,
                    designation: selectedDesignation
                      ? selectedDesignation.designations
                      : '',
                    designationId: selectedDesignation
                      ? selectedDesignation.id
                      : '',
                  }));
                }}
              >
                <option value="">Select designation</option>
                {designations.map((designation) => (
                  <option key={designation.id} value={designation.designations}>
                    {designation.designations}
                  </option>
                ))}
              </Input>
            </div>
            {isEditingWorkInfo && (
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
                      setIsEditingWorkInfo(!isEditingWorkInfo);
                    }}
                  >
                    save
                  </Button>
                  <button
                    className="btn btn-secondary"
                    style={{ marginLeft: '10px' }}
                    onClick={() => setIsEditingWorkInfo(!isEditingWorkInfo)}
                  >
                    cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </React.Fragment>
  );
};

export default Work;