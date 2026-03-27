import Dexie, { type Table } from 'dexie';
import type { CognitiveSignature, Reflex, Suggestion, Patch, AppSettings } from '@/types';

export class SynaptiforgeDB extends Dexie {
  signatures!: Table<CognitiveSignature, string>;
  reflexes!: Table<Reflex, string>;
  suggestions!: Table<Suggestion, string>;
  patches!: Table<Patch, string>;
  settings!: Table<AppSettings & { id: string }, string>;

  constructor() {
    super('synaptiforge');
    this.version(1).stores({
      signatures: 'id, version',
      reflexes: 'id, triggerPattern, enabled',
      suggestions: 'id, filePath, accepted',
      patches: 'id, filePath, status',
      settings: 'id',
    });
  }
}

export const db = new SynaptiforgeDB();
