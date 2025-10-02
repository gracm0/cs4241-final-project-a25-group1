import { Link } from "react-router-dom";
("use client");
import { motion } from "motion/react";
import { HeroHighlight, Highlight } from "../components/HeroHighlight";
import garden from "../assets/garden.jpg";
import amandaramen from "../assets/amandaramen.jpg";
import llama from "../assets/llama.png";
import beer from "../assets/beer.jpg";
import niacool from "../assets/niacool.jpg";
import elephant from "../assets/elephant.jpg";
import biglogo from "../assets/biglogo.png";
import { HoverBorderGradient } from "../components/hovergradientbutton";

export default function Home() {
  return (
    <main className="bg-hero min-h-100vh relative">
      <img
        src={biglogo}
        alt="PhotoBucket Logo"
        className="absolute top-4 left-4 w-[64px] h-auto z-50"
      />
      <div>
        {/* Images */}
        <img
          src={garden}
          aria-hidden
          className="object-cover w-[175px] h-[175px] fixed top-[20%] left-[6%] rotate-[-8deg] rounded-2xl"
        />
        <img
          src={llama}
          aria-hidden
          className="object-cover w-[175px] h-[175px] fixed top-[7%] left-[17%] rotate-[6deg] rounded-2xl"
        />
        <img
          src={amandaramen}
          aria-hidden
          className="object-cover w-[175px] h-[175px] fixed top-[12%] right-[10%] rotate-[8deg] rounded-2xl"
        />
        <img
          src={elephant}
          aria-hidden
          className="object-cover w-[175px] h-[175px] fixed bottom-[12%] left-[12%] rotate-[-6deg] rounded-2xl"
        />
        <img
          src={beer}
          aria-hidden
          className="object-cover w-[175px] h-[175px] fixed bottom-[20%] right-[16%] rotate-[4deg] rounded-2xl"
        />
        <img
          src={niacool}
          aria-hidden
          className="object-cover w-[175px] h-[175px] fixed bottom-[5%] right-[5%] rotate-[-4deg] rounded-2xl"
        />

        {/* Centered hero stack */}
        <div className="fixed inset-0 grid place-items-center" />
        {/* Middle hero */}
        <div className="fixed inset-0 grid place-items-center z-50">
          <div style={{ textAlign: "center" }}>
            {/* Logo */}
            <span className="logo-badge inline-flex items-center background-[#FF99A7] border-radius-[16px]">
              <img
                src={biglogo}
                alt="PhotoBucket"
                className="hero-logo w-[80px] h-auto"
              />
            </span>
            <p className="text-[#302F4D] mt-1 text-[20px] font-medium">
              PhotoBucket
            </p>

            <HeroHighlight>
              <motion.h1
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: [20, -5, 0],
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.4, 0.0, 0.2, 1],
                }}
                className="mt-5 mb-5 text-[73px] font-bold text-[#302F4D] max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto"
              >
                Every Bucket Deserves{" "}
                <span className="block">
                  <Highlight className="text-[#302F4D]">
                    A Photo Finish.
                  </Highlight>
                </span>
              </motion.h1>
            </HeroHighlight>

            <p className="text-[#302F4D] text-md font-medium text-[24px]">
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
              <div className="flex justify-center text-center">
                <HoverBorderGradient
                  as={Link}
                  to="/build?signup=1"
                  containerClassName="rounded-full"
                  className="flex items-center space-x-2"
                >
                  Build A Bucket
                </HoverBorderGradient>
              </div>

              {/* Open Login Modal */}
              <Link
                to="/build?login=1"
                className="btn text-sm text-[#302F4D] hover:underline"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
