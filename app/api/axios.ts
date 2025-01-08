// import axios from 'axios';

// // Create Axios instance
// const axiosInstance = axios.create({
//   withCredentials:true // Replace with your API base URL
// });

// // Add request interceptor
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Retrieve email from localStorage or any other storage mechanism
//     const email =  // Example: store email in localStorage

//     if (email) {
//       config.headers['Authorization'] = email; // Set email in Authorization header
//     }

//     return config;
//   },
//   (error) => {
//     // Handle request error
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
