import { memo } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import { Planet } from './Planet';

export const PlanetGroup = memo(function PlanetGroup() {
  const projectIds = useOrbitStore((s) => Object.keys(s.projects));

  return (
    <group>
      {projectIds.map((id, index) => (
        <Planet key={id} projectId={id} orbitIndex={index} />
      ))}
    </group>
  );
});
