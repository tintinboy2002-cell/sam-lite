import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  VStack,
  HStack,
  Heading,
  InputGroup,
  InputRightElement,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import httpInjectorService from "services/http-injector.service";
import { toast } from 'react-toastify';


const AddUserComponent = () => {
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const roles = [
    { id: "2", name: "Admin" },
    { id: "3", name: "Beta User" },
  ];

  const initialValues = {
    first_name: "",
    last_name: "",
    email: "",
    role_id: "",
    department: "",
    subDepartment: "",
    designation: "",
    date_of_joining: "",
    password: "",
  };

  const validationSchema = Yup.object({
    first_name: Yup.string()
      .matches(/^[a-zA-Z\s]*$/, "Only letters allowed")
      .required("First name is required"),

    last_name: Yup.string()
      .matches(/^[a-zA-Z\s]*$/, "Only letters allowed")
      .required("Last name is required"),

    email: Yup.string()
      .email("Invalid email")
      .required("Email is required"),

    role_id: Yup.string().required("Role is required"),

    department: Yup.string().required("Department is required"),

    subDepartment: Yup.string().required("Sub-Department is required"),

    designation: Yup.string().required("Designation is required"),

    date_of_joining: Yup.date()
      .max(new Date(), "Future date not allowed")
      .required("Joining date is required"),

    password: Yup.string()
      .min(8, "Minimum 8 characters")
      .matches(/[A-Z]/, "At least one uppercase letter")
      .matches(/[0-9]/, "At least one number")
      .matches(/[^A-Za-z0-9]/, "At least one special character")
      .required("Password is required"),
  });

  const fetchDepartments = async () => {
    const res = await httpInjectorService.getdepartment();
    if (res.status === "success") setDepartments(res.data);
  };

  const fetchDesignations = async () => {
    const res = await httpInjectorService.getdesignation();
    if (res.status === "success") setDesignations(res.data);
  };

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);

      const selectedDept = departments.find(
        (d) => d.department_name === values.department
      );

      const selectedSubDept = subDepartments.find(
        (s) => s.subdepartment === values.subDepartment
      );

      const selectedDesignation = designations.find(
        (d) => d.designations === values.designation
      );

      const userData = {
        ...values,
        departmentId: selectedDept?.department_id,
        subdepartmentId: selectedSubDept?.subdepartment_id,
        designationId: selectedDesignation?.id,
      };

      const response = await httpInjectorService.addUser(userData);

      if (response.status === "success") {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        })
        navigate("/Admin/user-management");
      } else {
          toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        })
      }
    } catch (err) {
      toast.error(err.message, {
          position: 'top-right',
          autoClose: 1000,
        })
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Box bg="gray.50" style={{ marginTop: '80px' }}>
      <Box
        maxW="500px"
        mx="auto"
        bg="white"
        p={8}
        borderRadius="xl"
        boxShadow="lg"
      >
        <Heading size="md" textAlign="center" mb={6} color="purple.600">
          Add New User
        </Heading>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <VStack spacing={4}>

                {/* Name */}
                <HStack w="100%">
                  <FormControl
                    isInvalid={errors.first_name && touched.first_name}
                  >
                    <FormLabel>First Name<span className="text-danger">*</span></FormLabel>
                    <Input
                      name="first_name"
                      value={values.first_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      focusBorderColor="purple.500"
                    />
                    <FormErrorMessage>
                      {errors.first_name}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isInvalid={errors.last_name && touched.last_name}
                  >
                    <FormLabel>Last Name<span className="text-danger">*</span></FormLabel>
                    <Input
                      name="last_name"
                      value={values.last_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      focusBorderColor="purple.500"
                    />
                    <FormErrorMessage>
                      {errors.last_name}
                    </FormErrorMessage>
                  </FormControl>
                </HStack>

                {/* Email */}
                <FormControl isInvalid={errors.email && touched.email}>
                  <FormLabel>Email<span className="text-danger">*</span></FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    focusBorderColor="purple.500"
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                {/* Role */}
                <FormControl isInvalid={errors.role_id && touched.role_id}>
                  <FormLabel>Role<span className="text-danger">*</span></FormLabel>
                  <Select
                    name="role_id"
                    placeholder="Select role"
                    value={values.role_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    focusBorderColor="purple.500"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.role_id}</FormErrorMessage>
                </FormControl>

                {/* Department */}
                <FormControl isInvalid={errors.department && touched.department}>
                  <FormLabel>Department<span className="text-danger">*</span></FormLabel>
                  <Select
                    name="department"
                    placeholder="Select department"
                    value={values.department}
                    onChange={(e) => {
                      handleChange(e);
                      const selected = departments.find(
                        (d) => d.department_name === e.target.value
                      );
                      setSubDepartments(selected?.subdepartments || []);
                    }}
                    onBlur={handleBlur}
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
                  <FormErrorMessage>{errors.department}</FormErrorMessage>
                </FormControl>

                {/* Sub Department */}
                <FormControl
                  isInvalid={errors.subDepartment && touched.subDepartment}
                >
                  <FormLabel>Sub Department<span className="text-danger">*</span></FormLabel>
                  <Select
                    name="subDepartment"
                    placeholder="Select sub-department"
                    value={values.subDepartment}
                    onChange={handleChange}
                    onBlur={handleBlur}
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
                  <FormErrorMessage>
                    {errors.subDepartment}
                  </FormErrorMessage>
                </FormControl>

                {/* Designation */}
                <FormControl
                  isInvalid={errors.designation && touched.designation}
                >
                  <FormLabel>Designation<span className="text-danger">*</span></FormLabel>
                  <Select
                    name="designation"
                    placeholder="Select designation"
                    value={values.designation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    {designations.map((d) => (
                      <option key={d.id} value={d.designations}>
                        {d.designations}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>
                    {errors.designation}
                  </FormErrorMessage>
                </FormControl>

                {/* Joining Date */}
                <FormControl
                  isInvalid={
                    errors.date_of_joining && touched.date_of_joining
                  }
                >
                  <FormLabel>Joining Date<span className="text-danger">*</span></FormLabel>
                  <Input
                    type="date"
                    name="date_of_joining"
                    value={values.date_of_joining}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <FormErrorMessage>
                    {errors.date_of_joining}
                  </FormErrorMessage>
                </FormControl>

                {/* Password */}
                <FormControl isInvalid={errors.password && touched.password}>
                  <FormLabel>Password<span className="text-danger">*</span></FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <InputRightElement>
                      <IconButton
                        size="sm"
                        icon={
                          showPassword ? <ViewOffIcon /> : <ViewIcon />
                        }
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <Button
                  colorScheme="purple"
                  type="submit"
                  w="full"
                  isLoading={loading}
                >
                  Create Account
                </Button>

                <Button
                  variant="outline"
                  colorScheme="red"
                  w="full"
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </Button>

              </VStack>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default AddUserComponent;