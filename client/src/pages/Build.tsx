// src/pages/Build.tsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import Home from "./Home";
import SignupModal from "../components/SignupModal";
import LoginModal from "../components/LoginModal";

/**
 * /build page
 * Renders Home as the background and shows Login/Signup modals based on query params.
 */
export function Build() {
    const [params] = useSearchParams();

    const showSignup = params.get("signup") === "1";
    const showLogin = !showSignup && params.get("login") === "1";

    return (
        <>
            <Home />

            {/* Modals */}
            <SignupModal open={showSignup} />
            <LoginModal open={showLogin} />
        </>
    );
}

export default Build;
