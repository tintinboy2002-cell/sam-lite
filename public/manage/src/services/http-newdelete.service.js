// this service is only used for FCM(firebase) device token generation
import axios from 'axios';
import Cookies from 'js-cookie';

const deleteDeviceTokenFromAPI = async (url, data = {}, headersObj = {}) => {
  url = `${process.env.REACT_APP_API_URL}${url}`;
  const tokenid = localStorage.getItem('authUser');
  const headers = { tokenid, ...headersObj };

  try {
    const response = await axios.delete(url, {
      headers,
      data, // ✅ Send the payload in the body, not in query params
    });
    return response.data;
  } catch (error) {
    return error.response
      ? error.response.data
      : { message: 'An error occurred' };
  }
};

export default { deleteDeviceTokenFromAPI };