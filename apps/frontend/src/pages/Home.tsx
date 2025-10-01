import { Link } from "react-router-dom";
import HeroHighlight from "../components/HeroHighlight";
import amanda from "../assets/Amanda1.JPG";
import amanda2 from "../assets/Amanda2.JPG";
import grace1 from "../assets/Grace1.png";
import grace2 from "../assets/Grace2.jpg";
import nia1 from "../assets/Nia1.jpg";
import nia2 from "../assets/Nia2.JPEG";
import logo from "../assets/logo.png";

export default function Home() {
  return (
    <main
      className="bg-hero"
      style={{ minHeight: "100vh", position: "relative" }}
    >
      {/* Floating photos (fixed positions) */}
      <img
        src={amanda}
        alt=""
        aria-hidden
        className="photo-card float-slow"
        style={{
          position: "fixed",
          top: "12%",
          left: "12%",
          transform: "rotate(-6deg)",
        }}
      />
      <img
        src={grace1}
        alt=""
        aria-hidden
        className="photo-card float-fast"
        style={{
          position: "fixed",
          top: "22%",
          left: "18%",
          transform: "rotate(-3deg)",
          zIndex: 10,
        }}
      />
      <img
        src={amanda2}
        alt=""
        aria-hidden
        className="photo-card float-med"
        style={{
          position: "fixed",
          top: "18%",
          right: "16%",
          transform: "rotate(6deg)",
        }}
      />
      <img
        src={nia2}
        alt=""
        aria-hidden
        className="photo-card float-slow"
        style={{
          position: "fixed",
          bottom: "12%",
          left: "14%",
          transform: "rotate(-3deg)",
        }}
      />
      <img
        src={grace2}
        alt=""
        aria-hidden
        className="photo-card float-med"
        style={{
          position: "fixed",
          bottom: "22%",
          right: "18%",
          transform: "rotate(3deg)",
        }}
      />
      <img
        src={nia1}
        alt=""
        aria-hidden
        className="photo-card float-fast"
        style={{
          position: "fixed",
          bottom: "10%",
          right: "10%",
          transform: "rotate(2deg)",
          zIndex: 10,
        }}
      />

      {/* Centered hero stack */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "grid",
          placeItems: "center",
          zIndex: 50,
        }}
      >
        <div
          style={{ textAlign: "center", maxWidth: "48rem", padding: "24px" }}
        >
          {/* Logo badge */}
          <span
            className="logo-badge glow"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "pink",
              padding: "6px", // tighter pink background
              borderRadius: "12px", // softer corners
            }}
          >
            <img
              src={logo}
              alt="PhotoBucket"
              className="hero-logo"
              style={{
                width: "80px", // logo stands out more
                height: "auto",
              }}
            />
          </span>

          <p
            className="brand-text"
            style={{ marginTop: 10, fontSize: 18, fontWeight: 600 }}
          >
            PhotoBucket
          </p>

          <h1
            className="text-brand-ink"
            style={{
              marginTop: 12,
              fontWeight: 900,
              lineHeight: 1.1,
              fontSize: "clamp(32px, 5vw, 56px)",
            }}
          >
            Every Bucket Deserves
          </h1>

          <HeroHighlight className="mt-3">
            <span className="highlight-pill">
              <span className="highlight-sheen">A Photo Finish.</span>
            </span>
          </HeroHighlight>

          <p className="tagline" style={{ marginTop: 16 }}>
            Start making memories today.
          </p>

          {/* Buttons */}
          <div
            style={{
              marginTop: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Open Signup Modal */}
            <Link to="/build?signup=1" className="btn btn-sky">
              Build A Bucket
            </Link>

            {/* Open Login Modal */}
            <Link to="/build?login=1" className="btn btn-outline rounded-full">
              Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
