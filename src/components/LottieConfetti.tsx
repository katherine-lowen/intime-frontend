"use client";

import { FC } from "react";
import Lottie from "lottie-react";
import confettiJson from "@/lottie/confetti.json";

const LottieConfetti: FC = () => {
  return (
    <Lottie
      animationData={confettiJson}
      loop={false}        // play once; set to true if you want looping
      autoplay
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default LottieConfetti;
