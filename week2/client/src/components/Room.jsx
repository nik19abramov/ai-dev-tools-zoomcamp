import React from "react";
import { useNavigate, Link } from "react-router-dom";
import Editor from "./collab/Editor.jsx";
import { socket, joinRoom } from "../socket.js";

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.mjs";

async function loadPyodideInstance() {
  if (window.__pyodideLoading) return window.__pyodideLoading;
  window.__pyodideLoading = import(PYODIDE_URL).then(({ loadPyodide }) =>
    loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/" })
  );
  return window.__pyodideLoading;
}

async function runJavaScript(code) {
  const logs = [];
  const sandboxConsole = {
    log: (...args) => logs.push(args.join(" ")),
    error: (...args) => logs.push(`ERROR: ${args.join(" ")}`),
    warn: (...args) => logs.push(`WARN: ${args.join(" ")}`),
  };

  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  try {
    const fn = new AsyncFunction("console", `"use strict"; ${code}`);
    const result = await fn(sandboxConsole);
    if (result !== undefined) logs.push(String(result));
    return { output: logs.join("\n") || "(no output)" };
  } catch (err) {
    return { output: `JS Error: ${err.message || err.toString()}` };
  }
}

async function runPython(code) {
  try {
    const pyodide = await loadPyodideInstance();
    const output = await pyodide.runPythonAsync(code);
    return { output: output ? output.toString() : "(no output)" };
  } catch (err) {
    return { output: `Py Error: ${err.message || err.toString()}` };
  }
}

export default function Room({ roomId }) {
  const [code, setCode] = React.useState("");
  const [language, setLanguage] = React.useState("javascript");
  const [output, setOutput] = React.useState("Run the code to see output");
  const [status, setStatus] = React.useState("connecting");

  React.useEffect(() => {
    joinRoom(roomId);
    setStatus("connected");

    const onInit = ({ code, language }) => {
      setCode(code || "");
      setLanguage(language || "javascript");
    };

    socket.on("init", onInit);
    socket.on("code_change", ({ code }) => setCode(code));
    socket.on("language_change", ({ language }) => setLanguage(language));

    return () => {
      socket.off("init", onInit);
      socket.off("code_change");
      socket.off("language_change");
      socket.disconnect();
    };
  }, [roomId]);

  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit("code_change", { roomId, code: value });
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    socket.emit("language_change", { roomId, language: lang });
  };

  const runCode = async () => {
    setOutput("Running...");
    if (language === "javascript") {
      const { output } = await runJavaScript(code);
      setOutput(output);
    } else {
      const { output } = await runPython(code);
      setOutput(output);
    }
  };

  return (
    <div className="layout">
      <header>
        <div>
          <h1>Room {roomId}</h1>
          <p>Status: {status}</p>
          <p className="hint">
            Share this link: <Link to={`/room/${roomId}`}>{window.location.origin}/room/{roomId}</Link>
          </p>
        </div>
        <div className="controls">
          <select value={language} onChange={handleLanguageChange}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
          <button className="button primary" onClick={runCode}>Run</button>
        </div>
      </header>

      <div className="card">
        <Editor
          value={code}
          language={language}
          onChange={handleCodeChange}
        />
      </div>

      <div className="card output">
        <div className="output-header">Output</div>
        <pre>{output}</pre>
      </div>
    </div>
  );
}
