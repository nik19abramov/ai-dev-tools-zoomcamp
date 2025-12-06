import React from "react";
import { Routes, Route, useNavigate, useParams, Navigate, Link } from "react-router-dom";
import Room from "./components/Room.jsx";

function Home() {
  const navigate = useNavigate();
  const [existing, setExisting] = React.useState("");

  const createRoom = () => {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 8);
    navigate(`/room/${id}`);
  };

  const joinExisting = (e) => {
    e.preventDefault();
    if (existing.trim()) {
      navigate(`/room/${existing.trim()}`);
    }
  };

  return (
    <div className="layout">
      <header>
        <h1>Collab Code</h1>
        <p>Spin up an interview room and code together.</p>
      </header>
      <div className="card">
        <button className="button primary" onClick={createRoom}>New Session</button>
        <form onSubmit={joinExisting} className="join-form">
          <input
            type="text"
            placeholder="Existing room id"
            value={existing}
            onChange={(e) => setExisting(e.target.value)}
          />
          <button type="submit" className="button">Join</button>
        </form>
      </div>
      <p className="hint">Share the URL you get with your candidate. No installs needed.</p>
    </div>
  );
}

function RoomWrapper() {
  const { roomId } = useParams();
  if (!roomId) return <Navigate to="/" replace />;
  return <Room roomId={roomId} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomId" element={<RoomWrapper />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
