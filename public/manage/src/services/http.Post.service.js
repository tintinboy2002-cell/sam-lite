import axios from 'axios';
import Cookies from 'js-cookie';

const postTOAPI = async (
  url,
  paramsObj,
  headersObj,
  mapped,
  setHeader,
  skipHandler,
) => {
   url = `${process.env.REACT_APP_API_URL}` + url;
  // url = `https://sam.nubaxdatalabs.com//` + url

  // url = `http://192.168.0.177:8085/` + url;

  const tokenid = localStorage.getItem('authUser');
  

  let headers = { tokenid };
  if (mapped == null) {
    mapped = true;
  }
  if (headersObj != null) {
    for (var key in headersObj) {
      headers[key] = headersObj[key];
    }
  }

  try {
    const response = await axios.post(url, paramsObj, { headers });
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// Assign the object to a variable before exporting
const apiService = {
  postTOAPI,
};

// Export the variable
export default apiService;
