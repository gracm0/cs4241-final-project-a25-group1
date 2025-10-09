// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import { Build } from "./pages/Build";
import BucketList from "./pages/Bucketlist";
import JoinBucket from "./pages/JoinBucket";

export default function App() {
  return (
    <Routes>
      {/* Marketing / landing */}
      <Route path="/" element={<Home />} />

      {/* Build page */}
      <Route path="/build" element={<Build />} />

      {/* Post-login dashboard (4 buckets, editable, invites) */}
      <Route path="/bucketlist" element={<BucketList />} />

      {/* Alias so deep links like /bucket/2 still work */}
      <Route path="/bucket/:id" element={<BucketList />} />

      {/* In your main App.tsx or router configuration */}
      <Route path="/join-bucket/:inviteCode" element={<JoinBucket />} />

      {/* Optional alias */}
      <Route path="/app" element={<Navigate to="/bucketlist" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
