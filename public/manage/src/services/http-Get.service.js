import axios from 'axios';
import Cookies from 'js-cookie';

const getDataFromAPI = async (url, paramsObj, headersObj, mapped) => {
  url = `${process.env.REACT_APP_API_URL}` + url;
  // url = `http://192.168.0.177:8085/` + url
  const tokenid = localStorage.getItem('authUser');
  
  let headers = headersObj || { tokenid };

  try {
    const response = await axios.get(url, { headers });
    return response.data
  } catch (error) {
    return error;
  }
};

export default { getDataFromAPI };
