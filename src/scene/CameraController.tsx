import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useOrbitStore } from '../store/useOrbitStore';
import { activePlanetPositions, getPlanetRadius } from '../utils/orbitalKinematics';
import { useReducedMotionPreference } from '../motion/useMotionPreference';
import { SIDE_PANEL_MIN_WIDTH, SIDE_PANEL_WIDTH } from '../components/ui/layout';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';

const DEFAULT_POS = new THREE.Vector3(0, 14, 25);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

/**
 * Camera director.
 *  - Fly-to keeps the viewer's current bearing (a dolly, not a cut) and re-aims at the planet's
 *    *live* position every frame, so moving planets never get missed.
 *  - After arrival the camera translates with the planet, preserving whatever angle the user chose.
 *  - A projection view-offset slides the planet into the free area beside the open panel.
 *  - Any user drag cancels the move immediately.
 */
export function CameraController() {
  const controlsRef = useRef<OrbitControlsType>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const invalidate = useThree((s) => s.invalidate);
  const viewportWidth = useThree((s) => s.size.width);
  const viewportHeight = useThree((s) => s.size.height);

  const selectedProjectId = useOrbitStore((s) => s.ui.selectedProjectId);
  const orbitIndex = useOrbitStore((s) =>
    s.ui.selectedProjectId ? Object.keys(s.projects).indexOf(s.ui.selectedProjectId) : -1
  );
  const panelOpen = useOrbitStore((s) => s.ui.panelOpen);
  const reduced = useReducedMotionPreference();

  const flight = useRef<gsap.core.Tween | null>(null);
  const flying = useRef(false);
  const firstRun = useRef(true);
  const lastPlanet = useRef(new THREE.Vector3());
  const hasLast = useRef(false);
  const shift = useRef({ x: 0, y: 0 });
  const shiftTween = useRef<gsap.core.Tween | null>(null);

  // ---- Fly-to / return-to-overview ------------------------------------------------------
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    flight.current?.kill();
    hasLast.current = false;

    const intro = firstRun.current && !selectedProjectId;
    firstRun.current = false;

    const startCam = camera.position.clone();
    const startTarget = controls.target.clone();
    const endCam = new THREE.Vector3();
    const endTarget = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const radius = orbitIndex >= 0 ? getPlanetRadius(orbitIndex) : 1;

    // Preserve the viewer's bearing, clamp elevation so we never end up under the orbital plane.
    dir.copy(startCam).sub(startTarget);
    if (dir.lengthSq() < 1e-3) dir.set(0.45, 0.4, 0.8);
    dir.normalize();
    dir.y = THREE.MathUtils.clamp(dir.y, 0.18, 0.6);
    dir.normalize();
    // Narrow (portrait) viewports see less horizontally, so pull back to keep the planet in frame
    const portraitBoost = camera.aspect < 1 ? 1 + (1 - camera.aspect) * 1.1 : 1;
    const closeDistance = THREE.MathUtils.clamp(radius * 8, 9, 13) * portraitBoost;

    const resolveEnd = () => {
      if (selectedProjectId) {
        const live = activePlanetPositions.get(selectedProjectId);
        endTarget.copy(live ?? DEFAULT_TARGET);
        endCam.copy(endTarget).addScaledVector(dir, closeDistance);
      } else {
        endTarget.copy(DEFAULT_TARGET);
        endCam.copy(DEFAULT_POS);
      }
    };
    const apply = (t: number) => {
      resolveEnd();
      camera.position.lerpVectors(startCam, endCam, t);
      controls.target.lerpVectors(startTarget, endTarget, t);
      controls.update();
    };

    if (reduced) {
      apply(1);
      flying.current = false;
      return;
    }

    const state = { t: 0 };
    flying.current = true;
    flight.current = gsap.to(state, {
      t: 1,
      // Longer journeys take slightly longer, so speed feels constant rather than the time
      duration: intro ? 2.6 : THREE.MathUtils.clamp(0.9 + startCam.distanceTo(DEFAULT_POS) * 0.02 + (selectedProjectId ? 0.3 : 0), 1.1, 1.9),
      ease: intro ? 'power3.out' : 'power3.inOut',
      onUpdate: () => apply(state.t),
      onComplete: () => {
        flying.current = false;
      },
    });

    return () => {
      flight.current?.kill();
    };
  }, [selectedProjectId, orbitIndex, camera, reduced]);

  // User input always wins over an automated move.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const cancel = () => {
      if (flying.current) {
        flight.current?.kill();
        flying.current = false;
      }
      hasLast.current = false;
    };
    controls.addEventListener('start', cancel);
    return () => controls.removeEventListener('start', cancel);
  }, []);

  // ---- Slide the subject clear of the side panel ------------------------------------------
  // Desktop: slide the planet left of the side panel. Phones and tablets: lift it above the bottom sheet.
  const hasPanel = !!(panelOpen && selectedProjectId);
  const wantX = hasPanel && viewportWidth >= SIDE_PANEL_MIN_WIDTH ? Math.min(SIDE_PANEL_WIDTH, viewportWidth * 0.6) / 2 : 0;
  const wantY = hasPanel && viewportWidth < SIDE_PANEL_MIN_WIDTH ? viewportHeight * 0.2 : 0;
  useEffect(() => {
    shiftTween.current?.kill();
    if (reduced) {
      shift.current.x = wantX;
      shift.current.y = wantY;
      invalidate();
      return;
    }
    shiftTween.current = gsap.to(shift.current, { x: wantX, y: wantY, duration: 0.8, ease: 'power3.out', onUpdate: () => invalidate() });
    return () => {
      shiftTween.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantX, wantY, reduced]);

  useEffect(
    () => () => {
      camera.clearViewOffset();
    },
    [camera]
  );

  useFrame(({ pointer, size, camera: cam }) => {
    const frameCamera = cam as THREE.PerspectiveCamera;
    const controls = controlsRef.current;
    if (!controls) return;

    if (selectedProjectId && !flying.current) {
      const live = activePlanetPositions.get(selectedProjectId);
      if (live) {
        if (hasLast.current) {
          const dx = live.x - lastPlanet.current.x;
          const dy = live.y - lastPlanet.current.y;
          const dz = live.z - lastPlanet.current.z;
          frameCamera.position.x += dx;
          frameCamera.position.y += dy;
          frameCamera.position.z += dz;
          controls.target.x += dx;
          controls.target.y += dy;
          controls.target.z += dz;
        }
        lastPlanet.current.copy(live);
        hasLast.current = true;
      }
    } else if (!selectedProjectId && !flying.current && !reduced) {
      // Overview: the whole system leans a few degrees toward the cursor
      controls.target.x = THREE.MathUtils.lerp(controls.target.x, pointer.x * 1.5, 0.03);
      controls.target.y = THREE.MathUtils.lerp(controls.target.y, pointer.y * 1.0, 0.03);
    }

    if (Math.abs(shift.current.x) > 0.5 || Math.abs(shift.current.y) > 0.5) {
      frameCamera.setViewOffset(size.width, size.height, shift.current.x, shift.current.y, size.width, size.height);
    } else if (frameCamera.view?.enabled) {
      frameCamera.clearViewOffset();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.7}
      zoomSpeed={0.8}
      minDistance={4}
      maxDistance={50}
      maxPolarAngle={Math.PI * 0.85}
      makeDefault
    />
  );
}
