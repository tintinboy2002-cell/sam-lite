import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';

const initialValues = {
  first_name: '',
  last_name: '',
  email: '',
  role_id: '',
  department: '',
  departmentId: '',
  subDepartment: '',
  subdepartmentId: '',
  designation: '',
  designationId: '',
};

const normalizeUser = (user) => {
  if (!user) return initialValues;
  return {
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    role_id: user.role_id || '',
    department: user.Department || '',
    departmentId: user.departmentId || '',
    subDepartment: user.SubDepartment || '',
    subdepartmentId: user.subdepartmentId || '',
    designation: user.Designation || '',
    designationId: user.designationId || '',
  };
};

function UserModal({
  isOpen,
  onClose,
  roles,
  departments,
  subDepartments,
  designations,
  selectedUser,
  setSubDepartments,
  updateUserDetails,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader className="text-center">Update User</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div className="p-2">
            <Formik
              initialValues={normalizeUser(selectedUser)}
              enableReinitialize
              onSubmit={(values, { setSubmitting }) => {
                const payload = {
                  ...values,
                  user_id: selectedUser?.user_id,
                };
                updateUserDetails(payload);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, setFieldValue, values }) => (
                <Form>
                  {/* First Name */}
                  <Field name="first_name">
                    {({ field }) => (
                      <FormControl mb={3}>
                        <FormLabel>
                          First Name<span className="text-danger">*</span>{' '}
                        </FormLabel>
                        <Input {...field} placeholder="First Name" />
                      </FormControl>
                    )}
                  </Field>

                  {/* Last Name */}
                  <Field name="last_name">
                    {({ field }) => (
                      <FormControl mb={3}>
                        <FormLabel>
                          Last Name<span className="text-danger">*</span>
                        </FormLabel>
                        <Input {...field} placeholder="Last Name" />
                      </FormControl>
                    )}
                  </Field>

                  {/* Email */}
                  <Field name="email">
                    {({ field }) => (
                      <FormControl mb={3}>
                        <FormLabel>
                          Email <span className="text-danger">*</span>
                        </FormLabel>
                        <Input {...field} placeholder="name@company.com" />
                      </FormControl>
                    )}
                  </Field>

                  {/* Role */}
                  <Field name="role_id">
                    {({ field }) => (
                      <FormControl mb={3}>
                        <FormLabel>
                          Role <span className="text-danger">*</span>
                        </FormLabel>
                        <Select
                          {...field}
                          placeholder="Select Role"
                          onChange={(e) =>
                            setFieldValue('role_id', e.target.value)
                          }
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Field>

                  {/* Department */}
                  <Field name="department">
                    {({ field }) => (
                      <FormControl mb={3}>
                        <FormLabel>
                          Department <span className="text-danger">*</span>
                        </FormLabel>
                        <Select
                          {...field}
                          placeholder="Select Department"
                          onChange={(e) => {
                            const deptName = e.target.value;
                            const dept = departments.find(
                              (d) => d.department_name === deptName,
                            );
                            setFieldValue('department', deptName);
                            setFieldValue(
                              'departmentId',
                              dept?.department_id || '',
                            );
                            setFieldValue('subDepartment', '');
                            setFieldValue('subdepartmentId', '');
                            setSubDepartments(dept?.subdepartments || []);
                          }}
                        >
                          {departments.map((dept) => (
                            <option
                              key={dept.department_id}
                              value={dept.department_name}
                            >
                              {dept.department_name}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Field>

                  {/* Sub-Department */}
                  <Field name="subDepartment">
                    {({ field }) => (
                      <FormControl mb={3}>
                        <FormLabel>
                          Sub-Department <span className="text-danger">*</span>
                        </FormLabel>
                        <Select
                          {...field}
                          placeholder="Select Sub-Department"
                          onChange={(e) => {
                            const subName = e.target.value;
                            const subDept = subDepartments.find(
                              (sd) => sd.subdepartment === subName,
                            );
                            setFieldValue('subDepartment', subName);
                            setFieldValue(
                              'subdepartmentId',
                              subDept?.subdepartment_id || '',
                            );
                          }}
                        >
                          {subDepartments.map((sub) => (
                            <option
                              key={sub.subdepartment_id}
                              value={sub.subdepartment}
                            >
                              {sub.subdepartment}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Field>

                  {/* Designation */}
                  <Field name="designation">
                    {({ field }) => (
                      <FormControl mb={3}>
                        <FormLabel>
                          Designation <span className="text-danger">*</span>
                        </FormLabel>
                        <Select
                          {...field}
                          placeholder="Select Designation"
                          onChange={(e) => {
                            const name = e.target.value;
                            const desig = designations.find(
                              (d) => d.designations === name,
                            );
                            setFieldValue('designation', name);
                            setFieldValue('designationId', desig?.id || '');
                          }}
                        >
                          {designations.map((des) => (
                            <option key={des.id} value={des.designations}>
                              {des.designations}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Field>

                  {/* Buttons */}
                  <ModalFooter>
                    <Button
                      colorScheme="red"
                      size="sm"
                      rounded={2}
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    &nbsp;
                    <Button
                      type="submit"
                      colorScheme="purple"
                      rounded={2}
                      size="sm"
                      className='ml-4'
                      isLoading={isSubmitting}
                    >
                      Update
                    </Button>
                  </ModalFooter>
                </Form>
              )}
            </Formik>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default UserModal;
