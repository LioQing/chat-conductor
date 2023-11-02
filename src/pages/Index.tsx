import React from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

function Index(): JSX.Element | null {
  const navigate = useNavigate();
  const [cookies] = useCookies();

  React.useEffect(() => {
    if (cookies['access-token']) {
      navigate('/pipeline');
    } else {
      navigate('/login');
    }
  }, [cookies, navigate]);

  return null;
}

export default Index;
