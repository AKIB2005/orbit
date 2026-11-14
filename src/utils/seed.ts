import type { Project, Task, DependencyLink } from '../types';
import { createId } from './id';
import { getOrbitalParameters, calculateOrbitalPosition } from './orbitalKinematics';

export function generateSeedData(): { projects: Project[]; tasks: Task[]; links: DependencyLink[] } {
  const now = Date.now();
  const idQuantum = createId();
  const idMobile = createId();
  const idNeural = createId();
  const idDesign = createId();
  const idCloud = createId();

  // Compute canonical initial orbital positions for 5 distinct planets
  const posQuantum = calculateOrbitalPosition(getOrbitalParameters(0), getOrbitalParameters(0).initialAngle);
  const posMobile = calculateOrbitalPosition(getOrbitalParameters(1), getOrbitalParameters(1).initialAngle);
  const posNeural = calculateOrbitalPosition(getOrbitalParameters(2), getOrbitalParameters(2).initialAngle);
  const posDesign = calculateOrbitalPosition(getOrbitalParameters(3), getOrbitalParameters(3).initialAngle);
  const posCloud = calculateOrbitalPosition(getOrbitalParameters(4), getOrbitalParameters(4).initialAngle);

  const projects: Project[] = [
    {
      id: idQuantum,
      name: 'Quantum Core Engine',
      description: 'High-performance WebGL 3D spatial coordinator and orbital physics pipeline.',
      colorTheme: 'violet',
      status: 'active',
      position: posQuantum,
      createdAt: now - 86400000 * 12,
      updatedAt: now,
    },
    {
      id: idMobile,
      name: 'Mobile Experience',
      description: 'Touch-optimized spatial controls, bottom sheet drawers, and gesture navigation.',
      colorTheme: 'cyan',
      status: 'active',
      position: posMobile,
      createdAt: now - 86400000 * 9,
      updatedAt: now,
    },
    {
      id: idNeural,
      name: 'Neural API Mesh',
      description: 'Scalable GraphQL API with DFS cycle detection and real-time dependency routing.',
      colorTheme: 'emerald',
      status: 'active',
      position: posNeural,
      createdAt: now - 86400000 * 7,
      updatedAt: now,
    },
    {
      id: idDesign,
      name: 'Cosmic Design System',
      description: 'Space Grotesk typography, glass panels, restrained glow tokens, and WCAG AA contrast.',
      colorTheme: 'rose',
      status: 'active',
      position: posDesign,
      createdAt: now - 86400000 * 5,
      updatedAt: now,
    },
    {
      id: idCloud,
      name: 'Cloud Infrastructure',
      description: 'Zero-latency IndexedDB offline persistence, sync daemon, and edge state recovery.',
      colorTheme: 'amber',
      status: 'active',
      position: posCloud,
      createdAt: now - 86400000 * 3,
      updatedAt: now,
    },
  ];

  const tasks: Task[] = [
    // Quantum Core tasks
    { id: createId(), projectId: idQuantum, title: 'Compile Custom Atmospheric Shader', description: 'Vertex displacement and Fresnel edge rim lighting.', status: 'done', priority: 'critical', dueDate: now - 86400000 * 2, orbitIndex: 0, createdAt: now - 86400000 * 10, updatedAt: now },
    { id: createId(), projectId: idQuantum, title: 'Optimize Instanced Starfield (2k stars)', description: 'Single draw-call matrix buffer with twinkling particles.', status: 'in_progress', priority: 'high', dueDate: now + 86400000 * 2, orbitIndex: 1, createdAt: now - 86400000 * 8, updatedAt: now },
    { id: createId(), projectId: idQuantum, title: 'Camera Bezier Slerp Interpolation', description: 'Smooth camera glide framing selected planetary coordinates.', status: 'todo', priority: 'medium', dueDate: now + 86400000 * 5, orbitIndex: 2, createdAt: now - 86400000 * 5, updatedAt: now },
    { id: createId(), projectId: idQuantum, title: 'Frame Rate Profiling & Budgeting', description: 'Ensure stable 60 FPS across mid-tier GPUs.', status: 'todo', priority: 'low', dueDate: null, orbitIndex: 3, createdAt: now - 86400000 * 3, updatedAt: now },

    // Mobile tasks
    { id: createId(), projectId: idMobile, title: 'Touch Pinch-to-Zoom Gesture', description: 'Calibrate sensitivity for mobile touchscreens.', status: 'in_progress', priority: 'critical', dueDate: now + 86400000 * 1, orbitIndex: 0, createdAt: now - 86400000 * 6, updatedAt: now },
    { id: createId(), projectId: idMobile, title: 'Responsive Bottom Sheet Drawer', description: 'Full-width task management on screens under 768px.', status: 'done', priority: 'high', dueDate: now - 86400000 * 1, orbitIndex: 1, createdAt: now - 86400000 * 5, updatedAt: now },
    { id: createId(), projectId: idMobile, title: 'Hardware DPR Adaptive Throttling', description: 'Cap DPR at 1.5 on low-power devices.', status: 'todo', priority: 'medium', dueDate: now + 86400000 * 7, orbitIndex: 2, createdAt: now - 86400000 * 3, updatedAt: now },

    // Neural API tasks
    { id: createId(), projectId: idNeural, title: 'DFS Graph Cycle Detection', description: 'Prevent circular dependency links in project topology.', status: 'done', priority: 'critical', dueDate: now - 86400000 * 3, orbitIndex: 0, createdAt: now - 86400000 * 7, updatedAt: now },
    { id: createId(), projectId: idNeural, title: 'Dynamic Quadratic Bezier Conduits', description: 'Animate dashed line offset connecting dependent worlds.', status: 'in_progress', priority: 'high', dueDate: now + 86400000 * 4, orbitIndex: 1, createdAt: now - 86400000 * 4, updatedAt: now },
    { id: createId(), projectId: idNeural, title: 'Dependency Telemetry Metrics', description: 'Show upstream and downstream dependency counts in drawer.', status: 'todo', priority: 'low', dueDate: null, orbitIndex: 2, createdAt: now - 86400000 * 2, updatedAt: now },

    // Cosmic Design tasks
    { id: createId(), projectId: idDesign, title: 'Space Grotesk & Inter Pairing', description: 'Implement typographic scale and display headings.', status: 'done', priority: 'high', dueDate: now - 86400000 * 1, orbitIndex: 0, createdAt: now - 86400000 * 4, updatedAt: now },
    { id: createId(), projectId: idDesign, title: 'Glassmorphism Blur & Rim Lighting', description: 'Calibrate subtle backdrop filter and frosted border tokens.', status: 'in_progress', priority: 'medium', dueDate: now + 86400000 * 3, orbitIndex: 1, createdAt: now - 86400000 * 3, updatedAt: now },
    { id: createId(), projectId: idDesign, title: 'Accessible Contrast Calibration', description: 'Ensure all HUD typography meets WCAG AA 4.5:1 ratio.', status: 'todo', priority: 'critical', dueDate: now + 86400000 * 6, orbitIndex: 2, createdAt: now - 86400000 * 2, updatedAt: now },

    // Cloud Infrastructure tasks
    { id: createId(), projectId: idCloud, title: 'IndexedDB Key-Val Persistence', description: 'Auto-save projects, tasks, and dependency links offline.', status: 'done', priority: 'critical', dueDate: now - 86400000 * 2, orbitIndex: 0, createdAt: now - 86400000 * 3, updatedAt: now },
    { id: createId(), projectId: idCloud, title: 'Seed Data Rehydration Guard', description: 'Automatically populate default cosmos if local storage empty.', status: 'in_progress', priority: 'high', dueDate: now + 86400000 * 4, orbitIndex: 1, createdAt: now - 86400000 * 2, updatedAt: now },
    { id: createId(), projectId: idCloud, title: 'Cloud Sync Architecture Spec', description: 'Prepare schema for post-MVP Supabase replication.', status: 'todo', priority: 'medium', dueDate: now + 86400000 * 12, orbitIndex: 2, createdAt: now - 86400000 * 1, updatedAt: now },
  ];

  const links: DependencyLink[] = [
    { id: createId(), sourceProjectId: idQuantum, targetProjectId: idNeural, createdAt: now - 86400000 * 4 },
    { id: createId(), sourceProjectId: idMobile, targetProjectId: idQuantum, createdAt: now - 86400000 * 3 },
    { id: createId(), sourceProjectId: idDesign, targetProjectId: idMobile, createdAt: now - 86400000 * 2 },
    { id: createId(), sourceProjectId: idCloud, targetProjectId: idQuantum, createdAt: now - 86400000 * 1 },
  ];

  return { projects, tasks, links };
}
