import axios from 'axios';
import Cookies from 'js-cookie';

const deleteDataFromAPI = async (url, data = {}, headersObj = {}) => {
   url = `${process.env.REACT_APP_API_URL}${url}`;
  // url = `http://192.168.0.177:8085/` + url
  const tokenid = localStorage.getItem('authUser');
  const headers = { tokenid, ...headersObj };
  try {
    // Add data as query parameters if DELETE method does not support request body
    const queryString = new URLSearchParams(data).toString();
    const response = await axios.delete(`${url}?${queryString}`, {
      headers
    });
    return response.data;
  } catch (error) {
    return error.response
      ? error.response.data
      : { message: 'An error occurred' };
  }
};

export default { deleteDataFromAPI };
