import React from 'react';
import useWindowDimensions from './useWindowDimensions';

function useContainerDimensions() {
  const { height, width } = useWindowDimensions();

  return React.useMemo(
    () => ({
      height: height - 64 - 24 - 24,
      width: width - 24 - 24,
    }),
    [height, width],
  );
}

export default useContainerDimensions;
