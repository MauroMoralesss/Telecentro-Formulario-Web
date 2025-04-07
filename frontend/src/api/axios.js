import axios from "axios";

const baseURL = process.env.VITE_BACKEND || "http://localhost:3000/api";

const instance = axios.create({
  baseURL,
  withCredentials: true
});

export default instance;
