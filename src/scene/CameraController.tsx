import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useOrbitStore } from '../store/useOrbitStore';
import { activePlanetPositions } from '../utils/orbitalKinematics';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';

export function CameraController() {
  const controlsRef = useRef<OrbitControlsType>(null);
  const { camera } = useThree();
  const selectedProjectId = useOrbitStore((s) => s.ui.selectedProjectId);
  const reducedMotion = useOrbitStore((s) => s.settings.reducedMotion);

  // Default overview parameters
  const defaultPos = useRef(new THREE.Vector3(0, 14, 25));
  const defaultTarget = useRef(new THREE.Vector3(0, 0, 0));
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    isTransitioning.current = true;

    if (selectedProjectId) {
      // Find current live coordinates of selected planet
      const livePos = activePlanetPositions.get(selectedProjectId) || new THREE.Vector3(0, 0, 0);

      const targetCamPos = new THREE.Vector3(
        livePos.x + 3.2,
        livePos.y + 2.2,
        livePos.z + 4.5
      );

      const duration = reducedMotion ? 0.01 : 0.9;

      gsap.to(camera.position, {
        x: targetCamPos.x,
        y: targetCamPos.y,
        z: targetCamPos.z,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          camera.updateProjectionMatrix();
        },
        onComplete: () => {
          isTransitioning.current = false;
        },
      });

      gsap.to(controls.target, {
        x: livePos.x,
        y: livePos.y,
        z: livePos.z,
        duration,
        ease: 'power2.out',
        onUpdate: () => controls.update(),
      });
    } else {
      // Return to majestic cosmic overview
      const duration = reducedMotion ? 0.01 : 0.8;

      gsap.to(camera.position, {
        x: defaultPos.current.x,
        y: defaultPos.current.y,
        z: defaultPos.current.z,
        duration,
        ease: 'power2.out',
        onUpdate: () => camera.updateProjectionMatrix(),
        onComplete: () => {
          isTransitioning.current = false;
        },
      });

      gsap.to(controls.target, {
        x: defaultTarget.current.x,
        y: defaultTarget.current.y,
        z: defaultTarget.current.z,
        duration,
        ease: 'power2.out',
        onUpdate: () => controls.update(),
      });
    }
  }, [selectedProjectId, camera, reducedMotion]);

  // Dynamic tracking & subtle mouse parallax
  useFrame(({ pointer }, delta) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    if (selectedProjectId && !isTransitioning.current) {
      // Smoothly follow the planet along its orbit
      const livePos = activePlanetPositions.get(selectedProjectId);
      if (livePos) {
        controls.target.lerp(livePos, delta * 3.5);
        controls.update();
      }
    } else if (!selectedProjectId && !isTransitioning.current && !reducedMotion) {
      // Subtle mouse parallax in overview mode
      const parallaxX = pointer.x * 1.5;
      const parallaxY = pointer.y * 1.0;
      controls.target.x = THREE.MathUtils.lerp(controls.target.x, parallaxX, 0.03);
      controls.target.y = THREE.MathUtils.lerp(controls.target.y, parallaxY, 0.03);
      controls.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={4}
      maxDistance={50}
      maxPolarAngle={Math.PI * 0.85}
      makeDefault
    />
  );
}
