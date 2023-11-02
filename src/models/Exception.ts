import { AxiosClient } from '../hooks/useAxios';

export interface Exception {
  code: string;
  message: string;
  response: {
    data: {
      detail: string;
      status: number;
      statusText: string;
    };
  };
}

export const handleException = <
  TBody extends object = {},
  THeaders extends object = {},
  TData extends object = {},
>(
  client: AxiosClient<TBody, THeaders, TData>,
): string | null => {
  if (!client.error) return null;

  try {
    return (client.error as Exception).response.data.detail;
  } catch (e) {
    return client.error.message;
  }
};
