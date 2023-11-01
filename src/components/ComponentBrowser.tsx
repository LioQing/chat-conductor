/* eslint-disable no-empty-pattern */
import React from 'react';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import SearchIcon from '@mui/icons-material/Search';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import ComponentSearch from '../models/ComponentSearch';
import Panel from './Panel';

// TODO: Delete this 20 components
const testComponents: ComponentSearch[] = [
  { id: 0, name: 'Hello World' } as ComponentSearch,
  { id: 1, name: 'Call GPT' } as ComponentSearch,
  { id: 2, name: 'Init GPT' } as ComponentSearch,
  { id: 3, name: 'Hello World1' } as ComponentSearch,
  { id: 4, name: 'Call GPT1' } as ComponentSearch,
  { id: 5, name: 'Init GPT1' } as ComponentSearch,
  { id: 6, name: 'Component 6' } as ComponentSearch,
  { id: 7, name: 'Component 7' } as ComponentSearch,
  { id: 8, name: 'Component 8' } as ComponentSearch,
  { id: 9, name: 'Component 9' } as ComponentSearch,
  { id: 10, name: 'Component 10' } as ComponentSearch,
  { id: 11, name: 'Component 11' } as ComponentSearch,
  { id: 12, name: 'Component 12' } as ComponentSearch,
  { id: 13, name: 'Component 13' } as ComponentSearch,
  { id: 14, name: 'Component 14' } as ComponentSearch,
  { id: 15, name: 'Component 15' } as ComponentSearch,
  { id: 16, name: 'Component 16' } as ComponentSearch,
  { id: 17, name: 'Component 17' } as ComponentSearch,
  { id: 18, name: 'Component 18' } as ComponentSearch,
  { id: 19, name: 'Component 19' } as ComponentSearch,
  { id: 20, name: 'Component 20' } as ComponentSearch,
  { id: 21, name: 'Component 21' } as ComponentSearch,
  { id: 22, name: 'Component 22' } as ComponentSearch,
  { id: 23, name: 'Component 23' } as ComponentSearch,
  { id: 24, name: 'Component 24' } as ComponentSearch,
  { id: 25, name: 'Component 25' } as ComponentSearch,
  { id: 26, name: 'Component 26' } as ComponentSearch,
  { id: 27, name: 'Component 27' } as ComponentSearch,
  { id: 28, name: 'Component 28' } as ComponentSearch,
  { id: 29, name: 'Component 29' } as ComponentSearch,
];

export interface ComponentBrowserProps {
  onSelectId: (id: number) => void;
}

function ComponentBrowser({ onSelectId }: ComponentBrowserProps) {
  const [search, setSearch] = React.useState('');
  const [option, setOption] = React.useState<'created' | 'templates'>(
    'created',
  );

  const searchedComponents = React.useMemo(() => {
    // TODO: Search in backend
    console.log('TODO: Search in backend');
    return testComponents.filter((component) =>
      component.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

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
