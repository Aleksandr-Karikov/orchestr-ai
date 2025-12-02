import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
} from "@mikro-orm/core";
import { Contract } from "./contract.entity";

@Entity({ tableName: "contract_versions" })
@Index({ properties: ["contract"] })
@Index({ properties: ["contract", "version"] })
@Index({ properties: ["is_current"] })
export class ContractVersion {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @ManyToOne(() => Contract, {
    deleteRule: "cascade",
    fieldName: "contract_id",
  })
  contract!: Contract;

  @Property({ type: "integer" })
  version!: number;

  @Property({ type: "jsonb" })
  snapshot!: Record<string, unknown>;

  @Property({ type: "text", nullable: true })
  change_summary?: string;

  @Property({ type: "boolean", default: false })
  is_current: boolean = false;

  @Property({ type: "timestamp", onCreate: () => new Date() })
  created_at!: Date;

  @Property({ type: "varchar", length: 255, nullable: true })
  created_by?: string;
}
