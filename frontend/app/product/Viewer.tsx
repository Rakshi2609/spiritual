"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Lightformer,
  Float,
} from "@react-three/drei";
import OmPendant from "./OmPendant";

/* The interactive 3D stage. Reflections come from in-scene Lightformers
   (no HDR download), so it works fully offline. */
export default function Viewer() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.6, 5.4], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#00000000"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.3} castShadow />
      <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#C6CCD8" />

      <Suspense fallback={null}>
        <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.4}>
          <OmPendant />
        </Float>

        <ContactShadows
          position={[0, -2.3, 0]}
          opacity={0.35}
          scale={8}
          blur={2.6}
          far={4}
          color="#5A4A2E"
        />

        {/* Custom environment built from soft light panels — gives the gold
            its reflections without fetching any external HDR map. */}
        <Environment resolution={256}>
          <Lightformer intensity={2} position={[0, 4, 2]} scale={[8, 4, 1]} color="#FFFFFF" />
          <Lightformer intensity={1.2} position={[-4, 1, 2]} scale={[3, 6, 1]} color="#DDE2EC" />
          <Lightformer intensity={1} position={[4, 1, 1]} scale={[3, 6, 1]} color="#FFFFFF" />
          <Lightformer intensity={0.8} position={[0, -3, -2]} scale={[8, 4, 1]} color="#C8CDD8" />
        </Environment>
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={3.2}
        maxDistance={7}
        autoRotate
        autoRotateSpeed={0.8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.6}
      />
    </Canvas>
  );
}
