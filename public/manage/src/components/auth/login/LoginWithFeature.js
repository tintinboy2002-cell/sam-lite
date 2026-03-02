import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  Input,
  Button,
  Checkbox,
  useColorModeValue,
  Image,
  Link as ChakraLink,
  InputGroup,
  InputRightElement,
  IconButton,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Card } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Cookies from 'js-cookie';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { encryptData } from 'utils/crypto';
import { motion, AnimatePresence } from 'framer-motion';

// Images
import samImg from '../../../assets/img/sam-amico.png';
import assetmanage from '../../../assets/img/asset-manage.png';
import procurement from '../../../assets/img/procurement-manage.png';
import taskmanage from '../../../assets/img/task-manage.png';

import { requestForToken } from '../../../firebase/notificationService';

export default function LoginUI() {
  const [selected, setSelected] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
 

  const features = [
    { id: 1, img: samImg, label: 'Comprehensive Employee Management' },
    { id: 2, img: assetmanage, label: 'Smart Attendance Tracking' },
    { id: 3, img: procurement, label: 'Performance & Appraisal Insights' },
    { id: 4, img: taskmanage, label: 'Leave & Time-Off Management' },
  ];


  useEffect(() => {
    const interval = setInterval(() => {
      setSelected((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

    useEffect(() => {
    // Ask permission and get token
    requestForToken().then((token) => {
      if (token) {
        console.log("FCM Token:", token);
        // You can send this token to your backend here
      }
    }, ).catch((err) => {
      console.error("Error getting FCM token:", err);
    });
  }, []);

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(6, 'Min 6 characters')
      .required('Password is required'),
  });

  // newly added code for desktop web
function getPlatform() {
  const ua = navigator.userAgent || '';

  try {
    // Detect custom app WebView
    if (ua.includes('MyApp')) {
      if (/Android/i.test(ua)) return 'Android App';
      if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS App';
      return 'App';
    }

    // Mobile browsers
    if (/Android/i.test(ua)) return 'Android Web';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS Web';

    // Desktop browsers
    if (/Win/i.test(ua)) return 'Windows Web';
    if (/Mac/i.test(ua)) return 'Mac Web';
    if (/Linux/i.test(ua)) return 'Linux Web';

    // Fallback
    return 'Web';
  } catch (err) {
    console.warn('Platform detection failed:', err);
    return 'Web';
  }
}

 // newly added code for desktop web
const sendDeviceDetails = async(fcm_token, platform) => {
    try {
      const device_type = platform;
      const response = await httpInjectorService.sendDeviceDetails({
        fcm_token,
        device_type
      });
      if (response.status === 'success') {
        console.log('Device details sent successfully');
      } else {
        console.warn('Failed to send device details:', response.message);
      }
    } catch (err) {
      console.error('Error sending device details:', err);
    }
};

  const handleSubmit = async (values, { validateForm }) => {
    setSubmitted(true);
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) return; // prevent login if invalid

    try {
      const response = await httpInjectorService.login({
        email: values.email,
        password: values.password
      });

      if (response.status === 'success') {
        console.log("hello from desktop web")
        // const fcm_token = await requestForToken(); // Get FCM Token
        const platform = getPlatform(); // Get platform type
        console.log('Platform detected:', platform);
        toast.success(response.message);
        handleLoginSuccess(response, values.email);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLoginSuccess = async(response, email) => {
    const fcm_token = await requestForToken(); // Get FCM Token
    // console.log("FCM Token in login ✅", fcm_token);

    const platform = getPlatform(); // Get platform type
    // console.log(response.data, "response Data")
    Cookies.set('authUser', response.data.tokenid);
    Cookies.set('userRole', encryptData(response.data.role));
    Cookies.set('email', email);
    Cookies.set('role_id', encryptData(response.data.role_id));
    Cookies.set('org_id', encryptData(response.data.org_id));
    Cookies.set('user_id', encryptData(response.data.user_id));
    Cookies.set('username', response.data.user_name);
    localStorage.setItem('authUser', response.data.tokenid);
    localStorage.setItem(
      'accessModules',
      response.data.accessmodule.Accessmodule,
    );
    sessionStorage.setItem('Logged In', true);

    await sendDeviceDetails(fcm_token, platform); // Send device details to backend

    navigate('/admin/default');
  };

  const signInWithOTP = async (email) => {
    try {
      const response = await httpInjectorService.signInwithotp({ email });
      if (response.status === 'success') {
        toast.success(response.message);
        Cookies.set('email', email);
        navigate('/login/signinotp');
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('OTP login failed');
    }
  };

  const handleGoogleLogin = async (values) => {
    try {
      const response = await httpInjectorService.login({
        token: values.credential
      });
      if (response.status === 'success') {
        toast.success(response.message);
        handleLoginSuccess(response, '');
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const goToForgot = () => navigate('/login/forgotpassword');

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(135deg, purple.700 0%, pink.500 100%)"
      p={6}
    >
      <Card
        className="w-100 shadow-2xl rounded-4"
        style={{
          maxWidth: '1200px',
          backdropFilter: 'blur(18px)',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <Flex direction={{ base: 'column', md: 'row' }}>
          {/* LEFT SIDE */}
          <Box
            position="relative"
            w={{ base: '100%', md: '50%' }}
            bg="rgba(255,255,255,0.08)"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            p={8}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={features[selected].id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.8 }}
                style={{ textAlign: 'center' }}
              >
                <Image
                  src={features[selected].img}
                  alt={features[selected].label}
                  boxSize={{ base: '220px', md: '360px' }}
                  mx="auto"
                  mb={4}
                  borderRadius="xl"
                  shadow="xl"
                />
                <Text
                  fontSize="xl"
                  fontWeight="semibold"
                  color="whiteAlpha.900"
                >
                  {features[selected].label}
                </Text>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <Flex justify="center" mt={6} gap={2}>
              {features.map((_, i) => (
                <Box
                  key={i}
                  w={i === selected ? '20px' : '10px'}
                  h="10px"
                  borderRadius="full"
                  bg={i === selected ? 'white' : 'whiteAlpha.400'}
                  transition="all 0.3s"
                  cursor="pointer"
                  onClick={() => setSelected(i)}
                />
              ))}
            </Flex>
          </Box>

          {/* RIGHT SIDE */}
          <Box
            w={{ base: '100%', md: '50%' }}
            p={{ base: 8, md: 12 }}
            bg="whiteAlpha.900"
          >
            <Text
              fontSize="3xl"
              fontWeight="bold"
              mb={8}
              textAlign="center"
              color="purple.700"
            >
              Welcome
            </Text>

            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                handleSubmit,
                handleChange,
                handleBlur,
                values,
                errors,
                touched,
              }) => (
                <form onSubmit={handleSubmit}>
                  <VStack spacing={3} align="stretch">
                    {/* Email */}
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600">
                        Email 
                      </FormLabel>
                      <Input
                        placeholder="Email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        variant="filled"
                        bg="gray.100"
                        borderColor={
                          (submitted && !values.email) || errors.email
                            ? 'red.500'
                            : 'gray.200'
                        }
                        _focus={{ bg: 'white', borderColor: 'purple.400' }}
                      />
                      {touched.email && errors.email && (
                        <Text fontSize="sm" color="red.500">
                          {errors.email}
                        </Text>
                      )}
                    </FormControl>

                    {/* Password */}
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600">
                        Password
                      </FormLabel>
                      <InputGroup>
                        <Input
                          placeholder="Password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          variant="filled"
                          bg="gray.100"
                          borderColor={
                            (submitted && !values.password) || errors.password
                              ? 'red.500'
                              : 'gray.200'
                          }
                          _focus={{ bg: 'white', borderColor: 'purple.400' }}
                        />
                        <InputRightElement>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowPassword(!showPassword)}
                            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                            aria-label="toggle password"
                          />
                        </InputRightElement>
                      </InputGroup>
                      {touched.password && errors.password && (
                        <Text fontSize="sm" color="red.500">
                          {errors.password}
                        </Text>
                      )}
                    </FormControl>

                    <Flex justify="space-between" mt={1}>
                      <ChakraLink
                        color="purple.600"
                        onClick={() => signInWithOTP(values.email)}
                      >
                        Login with OTP
                      </ChakraLink>
                      <ChakraLink color="purple.600" onClick={goToForgot}>
                        Forgot Password?
                      </ChakraLink>
                    </Flex>

                    <Checkbox colorScheme="purple">Remember me</Checkbox>

                    <Button
                      type="submit"
                      w="100%"
                      mt={4}
                      rounded="2"
                      colorScheme="purple"
                      size="lg"
                      transition="0.2s"
                      _hover={{ transform: 'scale(1.02)', shadow: 'md' }}
                    >
                      Login
                    </Button>
                  </VStack>
                </form>
              )}
            </Formik>

            {/* Google Sign In */}
            <Box mt={6} textAlign="center">
              <Box
                mx="auto"
                w="100%"
                maxW="full"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Box
                  w="100%"
                  maxW="100%"
                  transition="0.3s ease"
                  _hover={{ transform: 'scale(1.02)' }}
                >
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => toast.error('Google login failed')}
                    width="100%"
                    theme="outline"
                    size="large"
                    text="continue_with"
                    shape="rectangular"
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Card>
    </Flex>
  );
}
