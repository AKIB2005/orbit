import { describe, it, expect, beforeEach } from 'vitest';
import { useOrbitStore } from '../store/useOrbitStore';

describe('useOrbitStore CRUD & Cascades', () => {
  beforeEach(() => {
    // Reset store to known state
    const store = useOrbitStore.getState();
    const projectIds = Object.keys(store.projects);
    projectIds.forEach((id) => store.deleteProject(id));
  });

  it('creates and updates a project', () => {
    const store = useOrbitStore.getState();
    const pId = store.createProject({
      name: 'Alpha Centauri Base',
      description: 'Primary operations station',
      colorTheme: 'cyan',
      status: 'active',
      position: [10, 0, 5],
    });

    expect(useOrbitStore.getState().projects[pId]).toBeDefined();
    expect(useOrbitStore.getState().projects[pId].name).toBe('Alpha Centauri Base');

    store.updateProject(pId, { name: 'Alpha Centauri Station' });
    expect(useOrbitStore.getState().projects[pId].name).toBe('Alpha Centauri Station');
  });

  it('cascades deletion from project to related tasks, milestones, and links', () => {
    const store = useOrbitStore.getState();
    const p1 = store.createProject({
      name: 'P1',
      description: '',
      colorTheme: 'violet',
      status: 'active',
      position: [0, 0, 0],
    });
    const p2 = store.createProject({
      name: 'P2',
      description: '',
      colorTheme: 'cyan',
      status: 'active',
      position: [5, 0, 5],
    });

    const t1 = store.createTask({
      projectId: p1,
      title: 'Satellite Task 1',
      description: '',
      status: 'todo',
      priority: 'high',
      dueDate: null,
    });

    const m1 = store.createMilestone({
      projectId: p1,
      title: 'Orbital Insertion',
      dueDate: null,
      completed: false,
    });

    const linkId = store.createLink(p1, p2);
    expect(linkId).toBeTruthy();

    expect(useOrbitStore.getState().tasks[t1]).toBeDefined();
    expect(useOrbitStore.getState().milestones[m1]).toBeDefined();

    // Delete project 1
    store.deleteProject(p1);

    expect(useOrbitStore.getState().projects[p1]).toBeUndefined();
    expect(useOrbitStore.getState().tasks[t1]).toBeUndefined();
    expect(useOrbitStore.getState().milestones[m1]).toBeUndefined();
    if (linkId) {
      expect(useOrbitStore.getState().links[linkId]).toBeUndefined();
    }
  });

  it('cleans up dangling dependsOnTaskId when dependent task is deleted', () => {
    const store = useOrbitStore.getState();
    const p = store.createProject({
      name: 'Project Dep',
      description: '',
      colorTheme: 'rose',
      status: 'active',
      position: [0, 0, 0],
    });

    const t1 = store.createTask({
      projectId: p,
      title: 'Prerequisite Task',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
    });

    const t2 = store.createTask({
      projectId: p,
      title: 'Dependent Task',
      description: '',
      status: 'todo',
      priority: 'high',
      dueDate: null,
      dependsOnTaskId: t1,
    });

    expect(useOrbitStore.getState().tasks[t2].dependsOnTaskId).toBe(t1);

    // Delete prerequisite task t1
    store.deleteTask(t1);

    expect(useOrbitStore.getState().tasks[t1]).toBeUndefined();
    // t2 should now have null dependsOnTaskId, not a dangling pointer
    expect(useOrbitStore.getState().tasks[t2].dependsOnTaskId).toBeNull();
  });
});
