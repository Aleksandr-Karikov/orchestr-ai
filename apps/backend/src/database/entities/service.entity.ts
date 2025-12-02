import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Index,
  Enum,
} from "@mikro-orm/core";
import { System } from "./system.entity";
import { Contract } from "./contract.entity";
import { ServiceContractUsage } from "./service-contract-usage.entity";
import { IndexingStatus } from "./indexing-status.enum";

@Entity({ tableName: "services" })
@Index({ properties: ["system"] })
@Index({ properties: ["repository_url"] })
export class Service {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @ManyToOne(() => System, {
    deleteRule: "cascade",
    fieldName: "system_id",
  })
  system!: System;

  @Property({ type: "varchar", length: 255 })
  name!: string;

  @Property({ type: "varchar", length: 500 })
  repository_url!: string;

  @Property({ type: "varchar", length: 500, nullable: true })
  repository_path?: string;

  @Property({ type: "timestamp", nullable: true })
  last_indexed_at?: Date;

  @Enum(() => IndexingStatus)
  indexing_status: IndexingStatus = IndexingStatus.PENDING;

  @Property({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  @OneToMany(() => Contract, (contract) => contract.service)
  contracts = new Array<Contract>();

  @OneToMany(() => ServiceContractUsage, (usage) => usage.consumerService)
  contractUsages = new Array<ServiceContractUsage>();
}
