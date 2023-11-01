import React from 'react';

function useKey(key: string, cb: (event: KeyboardEvent) => void, deps?: any[]) {
  const callback = React.useRef(cb);

  React.useEffect(() => {
    callback.current = cb;
  });

  React.useEffect(() => {
    function handle(event: KeyboardEvent) {
      if (event.code === key) {
        callback.current(event);
      } else if (key === 'ctrls' && event.key === 's' && event.ctrlKey) {
        callback.current(event);
      }
    }

    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [key, ...(deps || [])]);
}

export default useKey;
