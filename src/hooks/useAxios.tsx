import React, { Dispatch, SetStateAction } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_COMPOSER_BASE_URL;

export interface AxiosRequest<
  TBody extends object = {},
  THeaders extends object = {},
  TData extends object = {},
> {
  url: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  body?: TBody;
  headers?: THeaders;
  data?: TData;
}

export interface AxiosClient<
  TResponseData extends object = any,
  TBody extends object = {},
  THeaders extends object = {},
  TData extends object = {},
> {
  response: AxiosResponse<TResponseData> | null;
  error: AxiosError | null;
  loading: boolean;
  sendRequest: Dispatch<
    SetStateAction<AxiosRequest<TBody, THeaders, TData> | null>
  >;
}

const useAxios = <
  TResponseData extends object,
  TBody extends object = {},
  THeaders extends object = {},
  TData extends object = {},
>(): AxiosClient<TResponseData, TBody, THeaders, TData> => {
  const [request, setRequest] = React.useState<AxiosRequest<
    TBody,
    THeaders,
    TData
  > | null>(null);
  const [response, setResponse] =
    React.useState<AxiosResponse<TResponseData> | null>(null);
  const [error, setError] = React.useState<AxiosError | null>(null);
  const [loading, setloading] = React.useState(false);

  const fetchData = () => {
    if (!request) return;

    setloading(true);
    setResponse(null);
    setError(null);
    axios
      .request({
        url: request.url,
        method: request.method,
        data: request.data,
        headers: request.headers,
      })
      .then((res) => {
        setResponse(res);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setloading(false);
      });
  };

  React.useEffect(() => {
    fetchData();
  }, [request]);

  return {
    response,
    error,
    loading,
    sendRequest: setRequest,
  };
};

export default useAxios;
