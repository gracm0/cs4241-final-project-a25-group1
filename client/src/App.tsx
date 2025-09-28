import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import { Build } from "./pages/Build";


export default function App() {
    return (
        <Routes>
            {/* Home page */}
            <Route path="/" element={<Home />} />

            {/* Build page (Home + modal) */}
            <Route path="/build" element={<Build />} />

            {/* Optional: redirect /app -> /build */}
            <Route path="/app" element={<Navigate to="/build" replace />} />

            {/* Catch-all: go home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

