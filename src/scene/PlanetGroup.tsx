import { memo, useMemo } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import { Planet } from './Planet';

export const PlanetGroup = memo(function PlanetGroup() {
  const projects = useOrbitStore((s) => s.projects);
  const projectIds = useMemo(() => Object.keys(projects), [projects]);

  return (
    <group>
      {projectIds.map((id, index) => (
        <Planet key={id} projectId={id} orbitIndex={index} />
      ))}
    </group>
  );
});
