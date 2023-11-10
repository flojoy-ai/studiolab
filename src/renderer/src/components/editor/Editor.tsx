import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';

const value = `import os

os.exit("1")
`;

const Editor = () => {
  return (
    <CodeMirror
      value={value}
      height="100%"
      style={{ height: '100%' }}
      className="h-full"
      extensions={[python()]}
    />
  );
};

export default Editor;
