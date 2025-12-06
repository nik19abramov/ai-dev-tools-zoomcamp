import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

export default function Editor({ value, onChange, language }) {
  const extensions = React.useMemo(() => {
    if (language === "python") return [python()];
    return [javascript({ jsx: true, typescript: true })];
  }, [language]);

  return (
    <CodeMirror
      value={value}
      height="60vh"
      theme={oneDark}
      extensions={extensions}
      onChange={(val) => onChange(val)}
      basicSetup={{ lineNumbers: true }}
    />
  );
}
