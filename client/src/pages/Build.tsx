import React from "react";
import Home from "./Home";
import SignupModal from "../components/SignupModal";

/**
 * /build page
 * Renders Home as the background and shows the signup modal on top.
 */
export function Build() {
    return (
        <>
            <Home />
            <SignupModal open={true} />
        </>
    );
}

export default Build;
