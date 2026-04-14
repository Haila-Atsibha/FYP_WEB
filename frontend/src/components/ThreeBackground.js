"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";

function FloatingBlobs() {
  const group = useRef();
  
  useFrame((state) => {
    if (group.current) {
        group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={1} floatIntensity={2} position={[2, 1, -5]}>
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial color="#6366f1" roughness={0.2} metalness={0.8} opacity={0.6} transparent />
        </mesh>
      </Float>
      
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2} position={[-3, -1, -8]}>
        <mesh>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial color="#a855f7" roughness={0.3} metalness={0.6} opacity={0.5} transparent />
        </mesh>
      </Float>
      
      <Float speed={2.5} rotationIntensity={2} floatIntensity={1} position={[1, -2, -4]}>
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#0ea5e9" roughness={0.1} metalness={0.9} opacity={0.7} transparent />
        </mesh>
      </Float>
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none opacity-50 mix-blend-screen bg-background">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <spotLight position={[-10, -10, -5]} intensity={0.5} color="#a855f7" />
        <Environment preset="city" />
        <FloatingBlobs />
        <fog attach="fog" args={['#08060f', 3, 12]} />
      </Canvas>
    </div>
  );
}
