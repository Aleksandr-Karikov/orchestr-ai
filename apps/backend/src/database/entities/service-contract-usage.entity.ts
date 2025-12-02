import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
  Enum,
} from "@mikro-orm/core";
import { Service } from "./service.entity";
import { Contract } from "./contract.entity";
import { ContractVersion } from "./contract-version.entity";
import { UsageType } from "./usage-type.enum";
import { DetectionMethod } from "./detection-method.enum";

@Entity({ tableName: "service_contract_usage" })
@Index({ properties: ["consumerService", "contract"] })
@Index({ properties: ["consumerService"] })
@Index({ properties: ["contract"] })
export class ServiceContractUsage {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @ManyToOne(() => Service, {
    deleteRule: "cascade",
    fieldName: "consumer_service_id",
  })
  consumerService!: Service;

  @ManyToOne(() => Contract, {
    deleteRule: "cascade",
    fieldName: "contract_id",
  })
  contract!: Contract;

  @ManyToOne(() => ContractVersion, {
    nullable: true,
    deleteRule: "set null",
    fieldName: "contract_version_id",
  })
  contractVersion?: ContractVersion;

  @Enum(() => UsageType)
  usage_type: UsageType = UsageType.MANUAL;

  @Enum(() => DetectionMethod)
  detection_method: DetectionMethod = DetectionMethod.MANUAL;

  @Property({ type: "timestamp", onCreate: () => new Date() })
  detected_at!: Date;

  @Property({ type: "decimal", precision: 3, scale: 2, nullable: true })
  confidence?: number;
}
