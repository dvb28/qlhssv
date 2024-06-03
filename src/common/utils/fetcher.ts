import axios, { AxiosResponse } from 'axios';
import { getSession, signOut } from 'next-auth/react';

// API Host
const host = 'localhost';

// Server Port
const port = '8080';

// BASE_URL
export const BASE_URL = `http://${host}:${port}`;

// API api
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to set the token in the request headers
api.interceptors.request.use(async (config) => {
  // Get token fom cookie
  const session: any = await getSession();

  // Check token is valid
  if (session?.token) {
    config.headers['Authorization'] = `Bearer ${session.token?.accessToken}`;
  }
  return config;
});

// Fetching
const fetching = async (response: AxiosResponse) => {
  // Get Status
  const status = response?.status;

  // Check Status
  const ok = status && status >= 200 && status < 400;

  // Unthorized
  if (status === 401) {
    // Sight out
    signOut({ callbackUrl: '/auth/login'});
  }

  // Fetch response data
  const data = response?.data;

  // Return Data
  return { status, ok, ...data };
};

// Custom Fetcher
const POST = async (url: string, data: any) => {
  // Create Fetch
  const response: AxiosResponse = await api
    .post(url, data)
    .then((res) => res)
    .catch((err) => err.response);

  // Return Fetching
  return fetching(response);
};

const PUT = async (url: string, data: any) => {
  // Create Fetch
  const response: AxiosResponse = await api
    .put(url, data)
    .then((res) => res)
    .catch((err) => err.response);

  // Return Fetching
  return fetching(response);
};

// Fetcher Upload file
const UPLOAD = async (url: string, payload: FormData) => {
  // Send file list
  const response: AxiosResponse = await api
    .post(url, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => res)
    .catch((err) => err.response);

  // Return Fetching
  return fetching(response);
};

// Fetcher Get
export const GET = async (
  url: string,
  params: { [key: string]: any } | null = null,
) => {
  // Response
  const response: AxiosResponse = await api
    .get(url, { params })
    .then((res) => res)
    .catch((err) => err.response);

  // Return Fetching
  return fetching(response);
};

// Fetcher Delete
const DELETE = async (
  url: string,
  params: { [key: string]: any } | null = null,
) => {
  // Response
  const response: AxiosResponse = await api
    .delete(url, { params })
    .then((res) => res)
    .catch((err) => err.response);

  // Return Fetching
  return fetching(response);
};

type Config = {
  method: string;
  url: string;
  payload?: FormData | any;
  params?: { [key: string]: any };
  admin?: boolean;
};

export const fetcher = async (config: Config) => {
  // Switch Case
  switch (config.method) {
    case 'POST':
      // Return Fetcher
      return await POST(config.url, config.payload);
    case 'PUT':
      // Return Fetcher
      return await PUT(config.url, config.payload);
    case 'GET':
      // Return Fetcher
      return await GET(config.url, config?.payload);
    case 'DELETE':
      // Return Fetcher
      return await DELETE(config.url, config?.payload);
    case 'UPLOAD':
      // Return Fetcher
      return await UPLOAD(config.url, config.payload);
  }
};
