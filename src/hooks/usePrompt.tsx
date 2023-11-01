import * as React from 'react';
import {
  useBeforeUnload,
  unstable_useBlocker as useBlocker,
} from 'react-router-dom';

function usePrompt(message: string | null, beforeUnload: boolean = false) {
  const blocker = useBlocker(
    React.useCallback(
      // eslint-disable-next-line no-alert
      () => (typeof message === 'string' ? !window.confirm(message) : false),
      [message],
    ),
  );
  const prevState = React.useRef(blocker.state);

  React.useEffect(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    prevState.current = blocker.state;
  }, [blocker]);

  useBeforeUnload(
    React.useCallback(
      (event) => {
        if (beforeUnload && typeof message === 'string') {
          event.preventDefault();
          event.returnValue = message;
        }
      },
      [message, beforeUnload],
    ),
    { capture: true },
  );
}

export default usePrompt;
