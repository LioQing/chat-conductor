import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export enum ArchiveType {
  ZIP = 'zip',
  TARGZ = 'targz',
}

export const mimeToExt = (mime: string) => {
  switch (mime) {
    case 'application/zip':
      return 'zip';
    case 'application/gzip':
      return 'tar.gz';
    default:
      return '';
  }
};

export const getPipelineDownload = (id: number, archiveType: ArchiveType) =>
  ({
    url: `/conductor/pipeline/download/${id}/${archiveType}/`,
    method: 'get',
    otherConfigs: {
      responseType: 'blob',
    },
  }) as ComposerAxiosRequest;
