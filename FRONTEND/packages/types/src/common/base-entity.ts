import type { IsoDateString, ObjectIdString } from './primitives';

/**
 * Campos mínimos compartilhados por praticamente todas as entidades do domínio.
 * Pensado para o lado "API/Frontend", não o documento bruto do banco.
 */
export interface BaseEntity {
  id: ObjectIdString;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
  isDeleted?: boolean;
}
