import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Label,
  Col,
  Input,
} from 'reactstrap';
import { Button } from '@chakra-ui/react';
import Select from 'react-dropdown-select';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';

const LeaveApplyModal = ({
  showForm,
  setShowForm,
  getAssignedLeaves,
  getLeavesDetails,
}) => {
  const [daySession] = useState([
    { select_half: 'First Half', start_day_session: 1, end_day_session: 2 },
    { select_half: 'Second Half', start_day_session: 1, end_day_session: 2 },
  ]);
  const [formData, setFormData] = useState({
    rule_id: '',
    leave_type: '',
    leave_balance: 0,
    start_date: '',
    start_day_session: '',
    end_date: '',
    end_day_session: '',
    reason_for_leave: '',
  });
  const [errors, setErrors] = useState({});
  const [buttonloader, setButtonLoader] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSelectChange = (name, value) => {
    if (name === 'leave_type' && value.length > 0) {
      setFormData({
        ...formData,
        leave_type: value[0].leave_type,
        rule_id: value[0].rule_id,
        leave_balance: value[0].leave_balance,
      });
    } else if (name === 'start_day_session' && value.length > 0) {
      if (value[0].select_half === 'First Half') {
        setFormData({ ...formData, start_day_session: 1 });
      } else if (value[0].select_half === 'Second Half') {
        setFormData({ ...formData, start_day_session: 2 });
      }
    } else if (name === 'end_day_session' && value.length > 0) {
      if (value[0].select_half === 'First Half') {
        setFormData({ ...formData, end_day_session: 1 });
      } else if (value[0].select_half === 'Second Half') {
        setFormData({ ...formData, end_day_session: 2 });
      }
    }
    setErrors({ ...errors, [name]: '' });
  };

  const calculateDays = (startDate, endDate, startSession, endSession) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    let days = diffTime / (1000 * 60 * 60 * 24) + 1;

    if (startDate === endDate && startSession === endSession) {
      days = 0.5;
    }
    return days;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.leave_type) newErrors.leave_type = 'Leave Type is required';
    if (!formData.start_date) newErrors.start_date = 'Start Date is required';
    if (!formData.start_day_session)
      newErrors.start_day_session = 'Start Half is required';
    if (!formData.end_date) newErrors.end_date = 'End Date is required';
    if (!formData.end_day_session)
      newErrors.end_day_session = 'End Half is required';
    if (!formData.reason_for_leave)
      newErrors.reason_for_leave = 'Reason is required';

    if (formData.start_date && formData.end_date) {
      const totalDays = calculateDays(
        formData.start_date,
        formData.end_date,
        formData.start_day_session,
        formData.end_day_session,
      );
      if (totalDays > formData.leave_balance) {
        newErrors.leave_balance = 'Insufficient Leave Balance';
        toast.error('Insufficient Leave Balance', {
          position: 'top-right',
          autoClose: 2000,
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setButtonLoader(true);
      try {
        const response = await httpInjectorService.applyLeave(formData);
        if (response.status === 'success') {
          toast.success(response.message, {
            position: 'top-right',
            autoClose: 2000,
          });
          setShowForm(false);
          getLeavesDetails();
          setFormData({
            rule_id: '',
            leave_type: '',
            leave_balance: 0,
            start_date: '',
            start_day_session: '',
            end_date: '',
            end_day_session: '',
            reason_for_leave: '',
          });
          setButtonLoader(false);
        } else {
          toast.error(response.message, {
            position: 'top-right',
            autoClose: 2000,
          });
          setShowForm(false);
          getLeavesDetails();
          setFormData({
            rule_id: '',
            leave_type: '',
            leave_balance: 0,
            start_date: '',
            start_day_session: '',
            end_date: '',
            end_day_session: '',
            reason_for_leave: '',
          });
          setButtonLoader(false);
        }
      } catch (err) {
        toast.error(err.message, {
          position: 'top-right',
          autoClose: 2000,
        });
        setShowForm(false);
        getLeavesDetails();
        setFormData({
          rule_id: '',
          leave_type: '',
          leave_balance: 0,
          start_date: '',
          start_day_session: '',
          end_date: '',
          end_day_session: '',
          reason_for_leave: '',
        });
        setButtonLoader(false);
      }
    }
  };

  return (
    <React.Fragment>
      <form>
        <Modal
          isOpen={showForm}
          toggle={() => setShowForm(!showForm)}
          backdrop="static"
        >
          <ModalHeader className="py-1" toggle={() => setShowForm(!showForm)}>
            Apply Leave
          </ModalHeader>
          <ModalBody toggle={() => setShowForm(!showForm)}>
            <Row className="mb-2">
              <Label>
                Leave Type<span className="text-danger">*</span>
              </Label>
              <Select
                name="leave_type"
                valueField="leave_type"
                labelField="leave_type"
                options={getAssignedLeaves}
                dropdownHeight="100px"
                clearable
                color="#884b9e"
                onChange={(values) =>
                  handleSelectChange(
                    'leave_type',
                    values.length > 0 ? values : [],
                  )
                }
                style={{ border: errors.leave_type ? '1px solid red' : '' }}
              />
              {errors.leave_type && (
                <span className="text-danger">{errors.leave_type}</span>
              )}
            </Row>
            <Row className="mb-2">
              <Col>
                <Label>
                  Start Date <span className="text-danger">*</span>
                </Label>
                <Input
                  type="date"
                  name="start_date"
                  className="form-control"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  style={{ border: errors.start_date ? '1px solid red' : '' }}
                />
                {errors.start_date && (
                  <span className="text-danger">{errors.start_date}</span>
                )}
              </Col>
              <Col>
                <Label>
                  Select Half <span className="text-danger">*</span>
                </Label>
                <Select
                  name="start_day_session"
                  valueField="select_half"
                  labelField="select_half"
                  dropdownHeight="100px"
                  options={daySession}
                  clearable
                  color="#884b9e"
                  onChange={(values) =>
                    handleSelectChange(
                      'start_day_session',
                      values.length > 0 ? values : [],
                    )
                  }
                  style={{
                    border: errors.start_day_session ? '1px solid red' : '',
                  }}
                />
                {errors.start_day_session && (
                  <span className="text-danger">
                    {errors.start_day_session}
                  </span>
                )}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col>
                <Label>
                  End Date <span className="text-danger">*</span>
                </Label>
                <Input
                  type="date"
                  name="end_date"
                  className="form-control"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  style={{ border: errors.end_date ? '1px solid red' : '' }}
                  min={formData.start_date}
                />
                {errors.end_date && (
                  <span className="text-danger">{errors.end_date}</span>
                )}
              </Col>
              <Col>
                <Label>
                  Select Half <span className="text-danger">*</span>
                </Label>
                <Select
                  name="end_day_session"
                  valueField="select_half"
                  labelField="select_half"
                  dropdownHeight="100px"
                  options={daySession}
                  clearable
                  color="#884b9e"
                  onChange={(values) =>
                    handleSelectChange(
                      'end_day_session',
                      values.length > 0 ? values : [],
                    )
                  }
                  style={{
                    border: errors.end_day_session ? '1px solid red' : '',
                  }}
                />
                {errors.end_day_session && (
                  <span className="text-danger">{errors.end_day_session}</span>
                )}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col>
                <Label>
                  Write Your Reason <span className="text-danger">*</span>
                </Label>
                <textarea
                  id="message"
                  name="reason_for_leave"
                  className="form-control"
                  placeholder="Enter Your Message"
                  value={formData.reason_for_leave}
                  onChange={handleInputChange}
                  style={{
                    border: errors.reason_for_leave ? '1px solid red' : '',
                  }}
                ></textarea>
                {errors.reason_for_leave && (
                  <span className="text-danger">{errors.reason_for_leave}</span>
                )}
              </Col>
            </Row>
            <Row style={{ float: 'right' }}>
              <div className="col-sm-6">
                <Button colorScheme="red" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
              <div className="col-sm-6">
                <Button
                  isLoading={buttonloader}
                  colorScheme="purple"
                  onClick={handleSubmit}
                >
                  Apply
                </Button>
              </div>
            </Row>
          </ModalBody>
        </Modal>
      </form>
    </React.Fragment>
  );
};

export default LeaveApplyModal;
