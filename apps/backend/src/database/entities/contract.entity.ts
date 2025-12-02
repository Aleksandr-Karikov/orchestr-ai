import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Index,
  Enum,
} from "@mikro-orm/core";
import { Service } from "./service.entity";
import { ContractVersion } from "./contract-version.entity";
import { ServiceContractUsage } from "./service-contract-usage.entity";
import { SourceType } from "./source-type.enum";

@Entity({ tableName: "contracts" })
@Index({ properties: ["service"] })
@Index({ properties: ["http_method", "path"] })
export class Contract {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @ManyToOne(() => Service, {
    deleteRule: "cascade",
    fieldName: "service_id",
  })
  service!: Service;

  @Property({ type: "varchar", length: 255 })
  name!: string;

  @Property({ type: "varchar", length: 10 })
  http_method!: string;

  @Property({ type: "varchar", length: 500 })
  path!: string;

  @Property({ type: "jsonb", nullable: true })
  request_schema?: Record<string, unknown>;

  @Property({ type: "jsonb", nullable: true })
  response_schema?: Record<string, unknown>;

  @Property({ type: "jsonb", nullable: true })
  parameters?: Record<string, unknown>;

  @Enum(() => SourceType)
  source_type: SourceType = SourceType.MANUAL;

  @Property({ type: "varchar", length: 500, nullable: true })
  source_file?: string;

  @Property({ type: "integer", nullable: true })
  source_line?: number;

  @Property({ type: "decimal", precision: 3, scale: 2, nullable: true })
  extraction_confidence?: number;

  @ManyToOne(() => ContractVersion, {
    nullable: true,
    deleteRule: "set null",
    fieldName: "current_version_id",
  })
  currentVersion?: ContractVersion;

  @Property({ type: "timestamp", onCreate: () => new Date() })
  created_at!: Date;

  @Property({ type: "timestamp", onUpdate: () => new Date() })
  updated_at!: Date;

  @OneToMany(() => ContractVersion, (version) => version.contract)
  versions = new Array<ContractVersion>();

  @OneToMany(() => ServiceContractUsage, (usage) => usage.contract)
  usages = new Array<ServiceContractUsage>();
}

