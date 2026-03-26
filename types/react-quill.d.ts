declare module 'react-quill' {
  import React from 'react';

  interface ReactQuillProps {
    theme?: string;
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    [key: string]: any;
  }

  const ReactQuill: React.FC<ReactQuillProps>;
  export default ReactQuill;
}
