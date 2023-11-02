import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Settings as SettingsData, SettingsContext } from './contexts/Settings';
import Pipeline from './pages/Pipeline';
import Account from './pages/Account';
import Settings from './pages/Settings';
import Login from './pages/Login';
import reportWebVitals from './reportWebVitals';
import './index.css';
import Scaffold from './components/Scaffold';
import Index from './pages/Index';
import useLocalStorage from './hooks/useLocalStorage';

const baseTheme = {
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 4,
        },
      },
    },
  },
};

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ef5350',
    },
    secondary: {
      main: '#26a69a',
    },
    background: {
      paper: '#ffffff',
      default: '#f5f5f5',
    },
  },
  ...baseTheme,
} as Object);

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ef5350',
    },
    secondary: {
      main: '#26a69a',
    },
    background: {
      paper: '#121212',
      default: '#121212',
    },
  },
  ...baseTheme,
} as Object);

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Scaffold />}>
        <Route index element={<Index />} />
        <Route path="pipeline/" element={<Pipeline />} />
        <Route path="account/" element={<Account />} />
        <Route path="settings/" element={<Settings />} />
      </Route>
      <Route path="/login/" element={<Login />} />
    </>,
  ),
);

function App() {
  const [settings, setSettings] = useLocalStorage<SettingsData>('settings', {
    darkMode: false,
  });

  return (
    <SettingsContext.Provider
      value={React.useMemo(
        () => ({ settings, setSettings }),
        [settings, setSettings],
      )}
    >
      <ThemeProvider theme={settings.darkMode ? darkTheme : lightTheme}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </SettingsContext.Provider>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
