import axios from "axios"
import Cookies from "js-cookie"

const putTOAPI = async (
  url,
  paramsObj,
  headersObj,
  mapped,
  setHeader,
  skipHandler
) => {
   url = `${process.env.REACT_APP_API_URL}` + url
  // url = `https://sam.nubaxdatalabs.com//` + url
  // url = `http://192.168.0.177:8085/` + url

  const tokenid = localStorage.getItem('authUser');


  // let headers = {}
  // ...this.storageService.getRequestHeaders()
  let headers = { tokenid }
  // let resp
  if (mapped == null) {
    mapped = true
  }
  if (headersObj != null) {
    for (var key in headersObj) {
      headers[key] = headersObj[key]
    }
  }

  try {
    const response = await axios.put(url, paramsObj, { headers })
    return response.data
  } catch (error) {
    return error.response.data
  }
}

export default { putTOAPI }
