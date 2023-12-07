import React, { Dispatch, SetStateAction } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useCookies } from 'react-cookie';
import { useStateWithCallbackLazy } from 'use-state-with-callback';
import { postTokenRefresh } from '../models/AuthTokenRefresh';

axios.defaults.baseURL = process.env.REACT_APP_COMPOSER_BASE_URL;

export interface ComposerAxiosRequest<
  TBody extends object = {},
  TData extends object = {},
  TParams extends object = {},
> {
  url: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  body?: TBody;
  data?: TData;
  params?: TParams;
}

export interface ComposerAxiosClient<
  TResponseData extends object = any,
  TBody extends object = {},
  TData extends object = {},
  TParams extends object = {},
> {
  request: ComposerAxiosRequest<TBody, TData, TParams> | null;
  response: AxiosResponse<TResponseData> | null;
  error: AxiosError | null;
  loading: boolean;
  sendRequest: (request?: ComposerAxiosRequest<TBody, TData, TParams>) => void;
  setResponse: Dispatch<SetStateAction<AxiosResponse<TResponseData> | null>>;
  setError: Dispatch<SetStateAction<AxiosError | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

const useComposerAxios = <
  TResponseData extends object,
  TBody extends object = {},
  TData extends object = {},
  TParams extends object = {},
>(
  defaultRequest: ComposerAxiosRequest<TBody, TData, TParams> | null = null,
): ComposerAxiosClient<TResponseData, TBody, TData, TParams> => {
  const [cookies, setCookies] = useCookies();
  const [request, setRequest] = useStateWithCallbackLazy<ComposerAxiosRequest<
    TBody,
    TData,
    TParams
  > | null>(defaultRequest);
  const [response, setResponse] =
    React.useState<AxiosResponse<TResponseData> | null>(null);
  const [error, setError] = React.useState<AxiosError | null>(null);
  const [loading, setLoading] = React.useState(false);

  const fetchData = (
    request: ComposerAxiosRequest<TBody, TData, TParams> | null,
  ) => {
    if (!request) return;

    setLoading(true);
    setResponse(null);
    setError(null);

    const fetchRequest = () => {
      axios
        .request({
          url: request.url,
          method: request.method,
          headers: {
            Authorization: `Bearer ${cookies['access-token']}`,
          },
          data: request.data,
          params: request.params,
        })
        .then((res) => {
          setResponse(res);
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    // refresh
    if (cookies['access-token'] === undefined) {
      axios
        .request(postTokenRefresh({ refresh: cookies['refresh-token'] }))
        .then((res) => {
          setCookies('access-token', res.data.access, {
            path: '/',
            expires: new Date(res.data.access_expiration),
          });
          fetchRequest();
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }
    fetchRequest();
  };

  const sendRequest = React.useCallback(
    (newRequest?: ComposerAxiosRequest<TBody, TData, TParams>) => {
      if (newRequest) {
        setRequest(newRequest, (request) => fetchData(request));
      } else {
        fetchData(request);
      }
    },
    [],
  );

  return {
    request,
    response,
    error,
    loading,
    sendRequest,
    setResponse,
    setError,
    setLoading,
  };
};

export default useComposerAxios;
