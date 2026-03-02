import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import httpInjectorService from 'services/http-injector.service';
import { setholidaydates } from 'store/actions';
import { Tabs, TabList, TabPanels, Tab, TabPanel, Box } from '@chakra-ui/react';
import {
  Table,
  Input,
  Modal as AntModal,
  Form,
  DatePicker,
  Space,
  Popconfirm,
  Upload,
  Button as AntButton,
  Card as AntCard,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/reset.css';
import HolidayCalendar from './HolidayCalendar';
import { BulletList } from 'react-content-loader';
import { Button } from '@chakra-ui/react';
import { Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { decryptData } from 'utils/crypto';
import Cookies from 'js-cookie';
const { TextArea } = Input;

const Holidaylist = () => {
  const [holidays, setHolidays] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [holidayid, setHolidayId] = useState('');
  const [buttonload, setButtonLoad] = useState(false);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const roleId = decryptData(Cookies.get('role_id'));
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const pageSizeOptions = [10, 20, 40, 50];

  // Fetch holidays
  const getHolidays = async () => {
    try {
      const response = await httpInjectorService.getHolidays();
      if (response?.status === 'success' && response?.data) {
        const formattedData = response.data.map((h) => ({
          ...h,
          key: h.id,
          date: moment(h.date),
        }));
        setHolidays(formattedData);
        dispatch(setholidaydates(response.data));
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('Failed to fetch holidays');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getHolidays();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setIsEditing(true);
    setSelectedHoliday(record);
    form.setFieldsValue({
      holiday_subject: record.holiday_subject,
      holiday_description: record.holiday_description,
      body_description: record.body_description,
      holiday_date: record.date,
    });
    setFileList(
      record.image
        ? [{ uid: '-1', name: 'Current Image', url: record.image }]
        : [],
    );
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await httpInjectorService.deleteHoliday({ id });
      if (response.status === 'success') {
        toast.success(response.message);
        getHolidays();
        setOpenDeleteModal(false);
      } else {
        toast.error(response.message);
        setOpenDeleteModal(false);
      }
    } catch (error) {
      toast.error('Failed to delete holiday');
      setOpenDeleteModal(false);
    } finally {
      setOpenDeleteModal(false);
    }
  };

  const handleSave = async (values) => {
    setButtonLoad(true);
    try {
      const payload = new FormData();
      payload.append('holiday_subject', values.holiday_subject);
      payload.append('holiday_description', values.holiday_description);
      payload.append('body_description', values.body_description);
      payload.append('holiday_date', values.holiday_date.format('YYYY-MM-DD'));

      const imageFile = values.holiday_image?.[0]?.originFileObj;
      if (imageFile) payload.append('image', imageFile);

      let response;
      if (isEditing) {
        payload.append('id', selectedHoliday.id);
        response = await httpInjectorService.updateHoliday(payload);
      } else {
        response = await httpInjectorService.addHoliday(payload);
      }

      if (response.status === 'success') {
        toast.success(response.message);
        getHolidays();
        setIsModalOpen(false);
        setButtonLoad(false);
        form.resetFields();
        setFileList([]);
      } else {
        toast.error(response.message);
        setButtonLoad(false);
      }
    } catch (error) {
      toast.error('Failed to save holiday');
      setButtonLoad(false);
    } finally {
      setIsModalOpen(false);
      setButtonLoad(false);
      form.resetFields();
      setFileList([]);
    }
  };

  const onOpenDeleteModal = (record) => {
    setOpenDeleteModal(true);
    setHolidayId(record.id);
  };

  const columns = [
    {
      title: 'S.No',
      width: '10%',
      align: 'center',
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,

      onHeaderCell: () => ({
        style: { backgroundColor: '#f0e6ff', color: '#6a0dad' },
      }),
    },

    {
      title: 'Name',
      dataIndex: 'holiday_description',
      width: '30%',
      onHeaderCell: () => ({
        style: { backgroundColor: '#f0e6ff', color: '#6a0dad' },
      }),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      render: (date) => date.format('DD-MM-YYYY'),
      width: '20%',
      onHeaderCell: () => ({
        style: { backgroundColor: '#f0e6ff', color: '#6a0dad' },
      }),
    },
    {
      title: 'Image',
      dataIndex: 'image',
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="holiday"
            style={{ width: 50, height: 50, objectFit: 'cover' }}
          />
        ) : (
          '-'
        ),
      width: '20%',
      onHeaderCell: () => ({
        style: { backgroundColor: '#f0e6ff', color: '#6a0dad' },
      }),
    },
    {
      title: 'Actions',
      width: '20%',
      onHeaderCell: () => ({
        style: { backgroundColor: '#f0e6ff', color: '#6a0dad' },
      }),
      render: (_, record) => (
        <Space>
          <AntButton
            icon={<EditOutlined />}
            style={{
              backgroundColor: '#6a0dad',
              color: '#fff',
              border: 'none',
            }}
            onClick={() => openEditModal(record)}
          />

          <AntButton
            onClick={() => onOpenDeleteModal(record)}
            icon={<DeleteOutlined />}
            style={{
              backgroundColor: '#a50034',
              color: '#fff',
              border: 'none',
            }}
          />
        </Space>
      ),
    },
  ];

  const filteredHolidays = holidays?.filter((item) =>
    item.holiday_description?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <Box style={{ marginTop: '60px' }} p={5}>
      <ToastContainer />
      <AntCard
        style={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: '4px',
        }}
        title={
          <span style={{ color: '#6a0dad', fontWeight: 'bold' }}>
            Holiday Management
          </span>
        }
      >
        {isLoading ? (
          <BulletList />
        ) : (
          <Tabs variant="line" colorScheme="purple">
            <TabList>
              {roleId === 1 ||
                (roleId === 2 && (
                  <Tab>
                    <CalendarOutlined style={{ marginRight: 5 }} /> Holiday List
                  </Tab>
                ))}
              <Tab>
                <CalendarOutlined style={{ marginRight: 5 }} /> Holiday Calendar
              </Tab>
            </TabList>

            <TabPanels>
              {roleId === 1 ||
                (roleId === 2 && (
                  <TabPanel>
                    <Space
                      style={{
                        marginBottom: 16,
                        width: '100%',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: 18, fontWeight: 'bold' }}>
                        Holidays
                      </span>
                      <AntButton
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ backgroundColor: '#6a0dad', border: 'none' }}
                        onClick={openAddModal}
                      >
                        Add Holiday
                      </AntButton>
                    </Space>
                    <Space style={{ marginBottom: 16 }}>
                      <Input
                        placeholder="Search..."
                        allowClear
                        style={{ width: 250 }}
                        value={searchText}
                        onChange={(e) => {
                          setSearchText(e.target.value);
                          setPagination({ ...pagination, current: 1 });
                        }}
                      />

                      <select
                        value={pagination.pageSize}
                        onChange={(e) =>
                          setPagination({
                            current: 1,
                            pageSize: Number(e.target.value),
                          })
                        }
                        style={{
                          height: '32px',
                          padding: '0 8px',
                          borderRadius: '4px',
                          border: '1px solid #d9d9d9',
                          cursor: 'pointer',
                        }}
                      >
                        {pageSizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </Space>

                    <Table
                      className="mt-2"
                      columns={columns}
                      dataSource={filteredHolidays}
                      pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: filteredHolidays.length,
                        showSizeChanger: false,
                        onChange: (page) => {
                          setPagination({ ...pagination, current: page });
                        },
                      }}
                    />
                  </TabPanel>
                ))}

              <TabPanel>
                <HolidayCalendar />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </AntCard>

      {/* Add/Edit Modal */}
      <AntModal
        title={isEditing ? 'Update Holiday' : 'Add Holiday'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSave}
          initialValues={{ holiday_date: null }}
        >
          <Form.Item
            label={
              <span>
                Holiday Description
                <span className="text-danger">*</span>{' '}
              </span>
            }
            name="holiday_description"
            rules={[
              { required: true, message: 'Please enter holiday description' },
            ]}
          >
            <Input placeholder="Enter holiday description" />
          </Form.Item>

          <Form.Item
            label={
              <span>
                Holiday Date<span className="text-danger">*</span>
              </span>
            }
            name="holiday_date"
            rules={[{ required: true, message: 'Please select holiday date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label={
              <span>
                Holiday Subject<span className="text-danger">*</span>
              </span>
            }
            name="holiday_subject"
            rules={[
              { required: true, message: 'Please enter holiday subject' },
            ]}
          >
            <TextArea placeholder="Enter holiday subject" />
          </Form.Item>

          <Form.Item
            label={
              <span>
                Body Description<span className="text-danger">*</span>
              </span>
            }
            name="body_description"
            rules={[
              { required: true, message: 'Please enter body description' },
            ]}
          >
            <TextArea placeholder="Enter body description" />
          </Form.Item>

          <Form.Item
            label={
              <span>
                Upload Image<span className="text-danger">*</span>
              </span>
            }
            name="holiday_image"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
            rules={[
              {
                validator: (_, value) => {
                  if (!isEditing && (!value || value.length === 0)) {
                    return Promise.reject(new Error('Please upload an image'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
            >
              <AntButton
                icon={<UploadOutlined />}
                style={{
                  backgroundColor: '#6a0dad',
                  color: '#fff',
                  border: 'none',
                }}
              >
                Select Image
              </AntButton>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <AntButton
                color="red"
                variant="outlined"
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                  setFileList([]);
                }}
              >
                Cancel
              </AntButton>
              <AntButton
                type="primary"
                htmlType="submit"
                loading={buttonload}
                style={{ backgroundColor: '#6a0dad', border: 'none' }}
              >
                Save
              </AntButton>
            </Space>
          </Form.Item>
        </Form>
      </AntModal>

      <Modal
        size="md"
        isOpen={openDeleteModal}
        toggle={() => setOpenDeleteModal(false)}
      >
        <ModalHeader toggle={() => setOpenDeleteModal(false)}>
          Confirm Deletion
        </ModalHeader>
        <ModalBody>Are you sure you want to delete this holiday ?</ModalBody>
        <ModalFooter>
          <Button
            rounded="3"
            onClick={() => setOpenDeleteModal(false)}
            colorScheme="red"
          >
            No
          </Button>
          <Button
            rounded="3"
            onClick={() => handleDelete(holidayid)}
            colorScheme="purple"
          >
            Yes
          </Button>
        </ModalFooter>
      </Modal>
    </Box>
  );
};

export default Holidaylist;
