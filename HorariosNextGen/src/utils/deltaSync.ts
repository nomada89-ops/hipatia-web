import { ParsedData, ParsedTeacher, ParsedSubject, ParsedGroup } from './delphosParser';

export interface DeltaChange<T> {
    id: string;
    item: T;
    type: 'NEW' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';
    modifications?: string[]; // Descriptions of what changed (e.g. "Name changed from A to B")
}

export interface DeltaReport {
    teachers: DeltaChange<ParsedTeacher>[];
    subjects: DeltaChange<ParsedSubject>[];
    groups: DeltaChange<ParsedGroup>[];
    stats: {
        newTeachers: number;
        removedTeachers: number;
        modifiedTeachers: number;
        newSubjects: number;
        removedSubjects: number;
        modifiedSubjects: number;
        newGroups: number;
        removedGroups: number;
        modifiedGroups: number;
    }
}

export const calculateDelta = (prev: ParsedData, next: ParsedData): DeltaReport => {
    const changes = {
        teachers: compareEntities(prev.teachers, next.teachers, compareTeachers),
        subjects: compareEntities(prev.subjects, next.subjects, compareSubjects),
        groups: compareEntities(prev.groups, next.groups, compareGroups)
    };

    return {
        ...changes,
        stats: {
            newTeachers: changes.teachers.filter(c => c.type === 'NEW').length,
            removedTeachers: changes.teachers.filter(c => c.type === 'REMOVED').length,
            modifiedTeachers: changes.teachers.filter(c => c.type === 'MODIFIED').length,
            newSubjects: changes.subjects.filter(c => c.type === 'NEW').length,
            removedSubjects: changes.subjects.filter(c => c.type === 'REMOVED').length,
            modifiedSubjects: changes.subjects.filter(c => c.type === 'MODIFIED').length,
            newGroups: changes.groups.filter(c => c.type === 'NEW').length,
            removedGroups: changes.groups.filter(c => c.type === 'REMOVED').length,
            modifiedGroups: changes.groups.filter(c => c.type === 'MODIFIED').length,
        }
    };
};

// Generic Comparator
function compareEntities<T extends { id: string }>(
    prevList: T[],
    nextList: T[],
    comparator: (a: T, b: T) => string[]
): DeltaChange<T>[] {
    const prevMap = new Map(prevList.map(i => [i.id, i]));
    const nextMap = new Map(nextList.map(i => [i.id, i]));
    const result: DeltaChange<T>[] = [];

    // Check Next items (New, Modified, Unchanged)
    nextList.forEach(nextItem => {
        const prevItem = prevMap.get(nextItem.id);
        if (prevItem) {
            const mods = comparator(prevItem, nextItem);
            if (mods.length > 0) {
                result.push({ id: nextItem.id, item: nextItem, type: 'MODIFIED', modifications: mods });
            } else {
                result.push({ id: nextItem.id, item: nextItem, type: 'UNCHANGED' });
            }
        } else {
            result.push({ id: nextItem.id, item: nextItem, type: 'NEW' });
        }
    });

    // Check Prev items (Removed)
    prevList.forEach(prevItem => {
        if (!nextMap.has(prevItem.id)) {
            result.push({ id: prevItem.id, item: prevItem, type: 'REMOVED' });
        }
    });

    return result;
}

// Specific Comparators
const compareTeachers = (a: ParsedTeacher, b: ParsedTeacher): string[] => {
    const mods = [];
    if (a.name !== b.name) mods.push(`Nombre: ${a.name} -> ${b.name}`);
    if (a.department !== b.department) mods.push(`Dpto: ${a.department} -> ${b.department}`);
    return mods;
};

const compareSubjects = (a: ParsedSubject, b: ParsedSubject): string[] => {
    const mods = [];
    if (a.name !== b.name) mods.push(`Nombre: ${a.name} -> ${b.name}`);
    // if (a.courseId !== b.courseId) mods.push(`Curso: ${a.courseId} -> ${b.courseId}`); // Course change is significant
    return mods;
};

const compareGroups = (a: ParsedGroup, b: ParsedGroup): string[] => {
    const mods = [];
    if (a.name !== b.name) mods.push(`Nombre: ${a.name} -> ${b.name}`);
    return mods;
};
