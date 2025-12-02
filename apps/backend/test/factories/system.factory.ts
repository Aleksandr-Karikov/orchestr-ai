import { System } from "../../src/database/entities/system.entity";

/**
 * Factory for creating test System entities
 */
export class SystemFactory {
  /**
   * Creates a System entity with default or custom values
   */
  static create(overrides?: Partial<System>): System {
    const system = new System();
    system.name = overrides?.name || `Test System ${Date.now()}`;
    system.description = overrides?.description || "Test system description";
    system.created_at = overrides?.created_at || new Date();
    system.updated_at = overrides?.updated_at || new Date();
    system.services = overrides?.services || [];

    if (overrides?.id) {
      system.id = overrides.id;
    }

    return system;
  }

  /**
   * Creates multiple System entities
   */
  static createMany(count: number, overrides?: Partial<System>): System[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
