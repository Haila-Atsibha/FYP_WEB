"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

function FloatingParticles() {
  const pointsRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Generate random positions (sphere distribution)
  const particlesPosition = useMemo(() => {
    const positionCount = 4000;
    const positions = new Float32Array(positionCount * 3);
    
    for (let i = 0; i < positionCount; i++) {
        // Radius between 3 and 15
        const r = 3 + Math.random() * 12;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
        pointsRef.current.rotation.x -= delta / 20;
        pointsRef.current.rotation.y -= delta / 30;
    }
  });

  return (
    <points 
      ref={pointsRef} 
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)}
    >
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={particlesPosition.length / 3} 
          array={particlesPosition} 
          itemSize={3} 
        />
      </bufferGeometry>
      <pointsMaterial 
        size={hovered ? 0.06 : 0.04} 
        color="#f97316" 
        sizeAttenuation={true} 
        transparent={true} 
        opacity={0.6} 
      />
    </points>
  );
}

export default function ThreeCanvas() {
  return (
    <div className="absolute inset-0 z-0 opacity-40 dark:opacity-70 pointer-events-auto mix-blend-screen dark:mix-blend-lighten">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <fog attach="fog" args={['#0f172a', 5, 20]} />
        <FloatingParticles />
      </Canvas>
    </div>
  );
}
