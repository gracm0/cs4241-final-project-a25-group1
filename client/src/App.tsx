// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import { Build } from "./pages/Build";
import BucketList from "./components/Bucketlist";
import MyBucket from "./pages/MyBucket";

export default function App() {
    return (
        <Routes>
            {/* Marketing / landing */}
            <Route path="/" element={<Home />} />

            {/* Build page */}
            <Route path="/build" element={<Build />} />

            {/* Post-login dashboard */}
            <Route path="/bucketlist" element={<BucketList />} />

            {/* A user's specific bucket (1..4) */}
            <Route path="/bucket/:id" element={<MyBucket />} />

            {/* Optional alias */}
            <Route path="/app" element={<Navigate to="/build" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}


