"use client";

import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { usePoseLandmarker } from "@/hooks/usePoseLandmarker";
import * as THREE from "three";
import type { PoseLandmarkerResult } from "@mediapipe/tasks-vision";

const ShirtModel = ({ landmarks }: { landmarks: PoseLandmarkerResult | null }) => {
    const groupRef = React.useRef<THREE.Group>(null);

    useFrame(() => {
        if (!groupRef.current) return;

        if (!landmarks || !landmarks.landmarks || landmarks.landmarks.length === 0) {
            groupRef.current.visible = false;
            return;
        }

        // Get shoulder landmarks (11: left shoulder, 12: right shoulder)
        const leftShoulder = landmarks.landmarks[0][11];
        const rightShoulder = landmarks.landmarks[0][12];

        if (leftShoulder && rightShoulder) {
            groupRef.current.visible = true;

            // Calculate center position (midpoint of shoulders)
            const x = -((leftShoulder.x + rightShoulder.x) / 2 - 0.5) * 10;
            const y = -((leftShoulder.y + rightShoulder.y) / 2 - 0.5) * 8;

            // Estimate scale based on shoulder width
            const shoulderWidth = Math.sqrt(
                Math.pow(rightShoulder.x - leftShoulder.x, 2) +
                Math.pow(rightShoulder.y - leftShoulder.y, 2)
            );
            const scale = shoulderWidth * 8; // Adjust multiplier as needed

            groupRef.current.position.set(x, y - (scale * 0.5), 0); // Offset y to align with shoulders
            groupRef.current.scale.set(scale, scale, scale);

            // Calculate rotation (roll)
            const angle = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x);
            groupRef.current.rotation.z = -angle;
        } else {
            groupRef.current.visible = false;
        }
    });

    return (
        <group ref={groupRef} visible={false}>
            {/* Torso */}
            <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[1, 1.5, 0.5]} />
                <meshStandardMaterial color="#4338ca" roughness={0.5} metalness={0.1} />
            </mesh>
            {/* Left Sleeve */}
            <mesh position={[-0.65, 0, 0]} rotation={[0, 0, 0.2]}>
                <cylinderGeometry args={[0.25, 0.2, 0.6, 16]} />
                <meshStandardMaterial color="#4338ca" roughness={0.5} metalness={0.1} />
            </mesh>
            {/* Right Sleeve */}
            <mesh position={[0.65, 0, 0]} rotation={[0, 0, -0.2]}>
                <cylinderGeometry args={[0.25, 0.2, 0.6, 16]} />
                <meshStandardMaterial color="#4338ca" roughness={0.5} metalness={0.1} />
            </mesh>
            {/* Neck/Collar */}
            <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.2, 0.05, 16, 32, Math.PI]} />
                <meshStandardMaterial color="#312e81" />
            </mesh>
        </group>
    );
};

const VirtualTryOn = ({ videoRef, isActive = false }: { videoRef: React.RefObject<HTMLVideoElement | null>, isActive?: boolean }) => {
    const { landmarks } = usePoseLandmarker(videoRef);

    return (
        <div className="absolute inset-0 pointer-events-none z-20">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                {isActive && <ShirtModel landmarks={landmarks} />}
            </Canvas>
        </div>
    );
};

export default VirtualTryOn;
