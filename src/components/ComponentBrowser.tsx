/* eslint-disable no-empty-pattern */
import React from 'react';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import SearchIcon from '@mui/icons-material/Search';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import {
  ComponentSearch,
  ComponentSearchParams,
  getComponentSearch,
} from '../models/ComponentSearch';
import Panel from './Panel';
import useComposerAxios from '../hooks/useComposerAxios';

export interface ComponentBrowserProps {
  onSelectId: (id: number) => void;
}

function ComponentBrowser({ onSelectId }: ComponentBrowserProps) {
  const [search, setSearch] = React.useState('');
  const [option, setOption] = React.useState<'created' | 'templates'>(
    'created',
  );
  const [searchedComponents, setSearchedComponent] = React.useState<
    ComponentSearch[]
  >([]);

  const componentSearchClient = useComposerAxios<
    ComponentSearch[],
    {},
    {},
    ComponentSearchParams
  >();

  React.useEffect(() => {
    componentSearchClient.sendRequest(
      getComponentSearch({
        query: search,
        filter: option,
      }),
    );
  }, [search, option]);

  React.useEffect(() => {
    if (!componentSearchClient.response) return;

    setSearchedComponent(componentSearchClient.response.data);
  }, [componentSearchClient.response]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleOption = (
    e: React.MouseEvent<HTMLElement>,
    newOption: 'created' | 'templates' | null,
  ) => {
    if (newOption) {
      setOption(newOption);
    }
  };

  const handleSelect = (id: number) => () => {
    onSelectId(id);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} height="100%">
      <Box display="flex" flexDirection="row" gap={2}>
        <ToggleButtonGroup
          size="small"
          value={option}
          exclusive
          onChange={handleOption}
          color="primary"
        >
          <ToggleButton value="created">Created</ToggleButton>
          <ToggleButton value="templates">Templates</ToggleButton>
        </ToggleButtonGroup>
        <OutlinedInput
          value={search}
          onChange={handleSearch}
          placeholder="Search"
          size="small"
          startAdornment={<SearchIcon />}
          sx={{ flex: 1 }}
        />
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
        gap={2}
        p={1}
        overflow="auto"
      >
        {searchedComponents.map((component) => (
          <Panel
            key={component.id}
            sx={{
              p: 0,
              pt: 0,
              overflow: 'hidden',
              flexBasis: 'calc(25% - 12px)',
            }}
          >
            <ButtonBase
              sx={{ p: 1, width: '100%', height: '100%' }}
              onClick={handleSelect(component.id)}
            >
              <Box display="flex" flexDirection="column">
                <Typography variant="body1" align="center">
                  {component.name}
                </Typography>
                <Typography variant="caption" align="center">
                  ID: {component.id}
                </Typography>
              </Box>
            </ButtonBase>
          </Panel>
        ))}
      </Box>
    </Box>
  );
}

export default ComponentBrowser;
