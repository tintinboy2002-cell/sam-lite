import { React, useEffect, useState } from 'react';
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Card,
  CardBody,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
} from 'reactstrap';
import {
  Box,
  Flex,
  Button,
  Input,
  Tooltip,
  Tbody,
  Text,
} from '@chakra-ui/react';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import AssignWork from './Assignworkweek';
import CreateWorkWeek from './CreateWorkWeek';
import SkeletonWithLoaders from 'components/common/Spinner';

const Workweek = () => {
  const initialData = [
    { id: 1, status: 'green', rule_id: 22 },
    { id: 2, status: 'green', rule_id: 22 },
    { id: 3, status: 'green', rule_id: 22 },
    { id: 4, status: 'green', rule_id: 22 },
    { id: 5, status: 'green', rule_id: 22 },
    { id: 6, status: 'green', rule_id: 22 },
    { id: 7, status: 'green', rule_id: 22 },
    { id: 8, status: 'green', rule_id: 22 },
    { id: 9, status: 'green', rule_id: 22 },
    { id: 10, status: 'green', rule_id: 22 },
    { id: 11, status: 'green', rule_id: 22 },
    { id: 12, status: 'green', rule_id: 22 },
    { id: 13, status: 'green', rule_id: 22 },
    { id: 14, status: 'green', rule_id: 22 },
    { id: 15, status: 'green', rule_id: 22 },
    { id: 16, status: 'green', rule_id: 22 },
    { id: 17, status: 'green', rule_id: 22 },
    { id: 18, status: 'green', rule_id: 22 },
    { id: 19, status: 'green', rule_id: 22 },
    { id: 20, status: 'green', rule_id: 22 },
    { id: 21, status: 'green', rule_id: 22 },
    { id: 22, status: 'green', rule_id: 22 },
    { id: 23, status: 'green', rule_id: 22 },
    { id: 24, status: 'green', rule_id: 22 },
    { id: 25, status: 'green', rule_id: 22 },
    { id: 26, status: 'green', rule_id: 22 },
    { id: 27, status: 'green', rule_id: 22 },
    { id: 28, status: 'green', rule_id: 22 },
    { id: 29, status: 'green', rule_id: 22 },
    { id: 30, status: 'green', rule_id: 22 },
    { id: 31, status: 'green', rule_id: 22 },
    { id: 32, status: 'green', rule_id: 22 },
    { id: 33, status: 'green', rule_id: 22 },
    { id: 34, status: 'green', rule_id: 22 },
    { id: 35, status: 'green', rule_id: 22 },
  ];

  const [activeTab, setActiveTab] = useState('1');
  const [modal, setModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [ruleModal, setRuleModal] = useState(false);
  const [popUp, setPopUp] = useState(false);

  const [selectedData, setSelectedData] = useState(initialData);
  const [calendar, setCalender] = useState([]);
  const [renderRules, setRenderRules] = useState(false);
  const [table, setTable] = useState();

  const [day, setDay] = useState({ id: '', status: '' });
  const [modall, setModall] = useState(false);

  const toggle = () => {
    setModall(!modall);
  };

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const [savedRules, setSavedRules] = useState([]); // State to hold saved rules
  const [cardRules, setCardRules] = useState({}); // State to hold rules for each card
  const [errors, setErrors] = useState({
    ruleName: '',
    description: '',
  }); // State to hold form errors

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const togglePopUp = () => {
    setPopUp(!popUp);
  };

  const toggleModal = (day) => {
    setSelectedDay(day);
    setSelectedData();
    setModal(!modal);
  };

  const toggleRuleModal = () => {
    setRuleModal((prevState) => !prevState);
  };

  const saveWorkWeekRules = async (selectedData) => {
    try {
      // const data = { weekDaysStatus };
      const response = await httpInjectorService.createworkweekrule(
        selectedData,
      );
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
      alert('Work week rules saved successfully!');
    } catch (error) {
      alert('Failed to save work week rules. Please try again.');
    }
  };

  const [formData, setFormData] = useState({
    ruleName: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let error = '';

    if (name === 'ruleName') {
      if (!value.trim()) {
        error = 'Rule Name cannot be empty or contain only spaces.';
      } else if (value.length > 25) {
        error = 'Rule Name cannot exceed 25 characters.';
      }
    } else if (name === 'description') {
      if (value.length > 25) {
        error = 'Description cannot exceed 25 characters.';
      }
    }

    setErrors({ ...errors, [name]: error });

    // Always update formData
    setFormData({ ...formData, [name]: value });
  };

  const deleteworkweek = async (id) => {
    try {
      const response = await httpInjectorService.deleteworkweekrule({
        ruleId: id,
      });
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        setSavedRules((prevRules) =>
          prevRules.filter((rule) => rule.id !== id),
        );
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error(err); // Optionally handle the error
    }
  };

  const createworkweek = async (formData) => {
    try {
      const response = await httpInjectorService.createworkweekrule(formData);
      if (response.status === 'success') {
        setSavedRules([...savedRules, formData]);
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        getworkweeks();
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSaveRule = () => {
    // Save the rule to the savedRules state
    createworkweek(formData);
    setFormData({ ruleName: '', description: '' }); // Reset form
    togglePopUp(); // Close the modal
  };


  const getworkweeks = async () => {
    try {
      const response = await httpInjectorService.getworkweekrule();
      if (response.status === 'success') {
        setSavedRules(response.data);
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        // toast.error(response.message, {
        //   position: 'top-right',
        //   autoClose: 3000,
        // });
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getworkweeks();
  }, []);

  const updateWorkWeek = async (calendar) => {
    try {
      const response = await httpInjectorService.updateRules(calendar);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: '2000',
        });
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: '2000',
        });
      }
    } catch (err) {
      console.log(err, 'dashboard file');
    } finally {
      //  setCalender([]);
    }
  };

  const viewRulesCalender = async (id) => {
    try {
      const response = await httpInjectorService.getworkweekcalender(id);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        setCalender(response.data);
      } else {
        // toast.error(response.message, {
        //   position: 'top-right',
        //   autoClose: 3000,
        // });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setRenderRules(true);
      toggle();
    }
  };

  const handleClick = (index) => {
    setCalender((prevData) => {
      const newData = [...prevData];
      const currentStatus = newData[index].is_working;

      // Update the status based on current status
      if (currentStatus === 'fullday') {
        newData[index].is_working = 'halfday';
      } else if (currentStatus === 'halfday') {
        newData[index].is_working = 'holiday';
      } else {
        newData[index].is_working = 'fullday';
      }

      return newData;
    });
  };

  return (
    <>
    <SkeletonWithLoaders>
      <Card
        className="shadow p-1 bg-white"
        style={{ borderRadius: '10px', marginTop: '80px' }}
      >
        <CardBody>
          <Nav
            tabs
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', flexGrow: 1 }}>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '1' })}
                  onClick={() => toggleTab('1')}
                  style={{ cursor: 'pointer', color: 'purple' }}
                >
                  <span className="d-none d-sm-block"> Create work week </span>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '2' })}
                  onClick={() => toggleTab('2')}
                  style={{ cursor: 'pointer', color: 'purple' }}
                >
                  <span className="d-none d-sm-block"> Assign work week </span>
                </NavLink>
              </NavItem>
            </div>
          </Nav>

          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
                <CreateWorkWeek
                handleChange={handleChange}
                errors={errors}
                handleSaveRule={handleSaveRule}
                savedRules={savedRules}
                viewRulesCalender={viewRulesCalender}
                deleteworkweek={deleteworkweek}
                renderRules={renderRules}
                calendar={calendar}
                modall={modall}
                toggle={toggle}
                daysOfWeek={daysOfWeek}
                handleClick={handleClick}
                updateWorkWeek={updateWorkWeek}
                togglePopUp={togglePopUp}
                popUp={popUp}
                formData={formData}
              />
            </TabPane>

            <TabPane tabId="2" activeTab={activeTab}>
              <AssignWork getworkweeks={getworkweeks} activeTab={activeTab} />
            </TabPane>
            <TabPane tabId="3" activeTab={activeTab}>
              {/* <HolidayCalender/> */}
            </TabPane>
          </TabContent>
        </CardBody>
      </Card>
    </SkeletonWithLoaders>
    </>
  );
};

export default Workweek;
