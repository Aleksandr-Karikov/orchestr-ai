import { ServiceContractUsage } from "../../src/database/entities/service-contract-usage.entity";
import { Service } from "../../src/database/entities/service.entity";
import { Contract } from "../../src/database/entities/contract.entity";
import { ContractVersion } from "../../src/database/entities/contract-version.entity";
import { UsageType } from "../../src/database/entities/usage-type.enum";
import { DetectionMethod } from "../../src/database/entities/detection-method.enum";

/**
 * Factory for creating test ServiceContractUsage entities
 */
export class ServiceContractUsageFactory {
  /**
   * Creates a ServiceContractUsage entity with default or custom values
   */
  static create(
    consumerService: Service,
    contract: Contract,
    overrides?: Partial<ServiceContractUsage>,
  ): ServiceContractUsage {
    const usage = new ServiceContractUsage();
    usage.consumerService = consumerService;
    usage.contract = contract;
    usage.contractVersion = overrides?.contractVersion;
    usage.usage_type = overrides?.usage_type || UsageType.MANUAL;
    usage.detection_method =
      overrides?.detection_method || DetectionMethod.MANUAL;
    usage.detected_at = overrides?.detected_at || new Date();
    usage.confidence = overrides?.confidence;

    if (overrides?.id) {
      usage.id = overrides.id;
    }

    return usage;
  }

  /**
   * Creates multiple ServiceContractUsage entities
   */
  static createMany(
    consumerService: Service,
    contract: Contract,
    count: number,
    overrides?: Partial<ServiceContractUsage>,
  ): ServiceContractUsage[] {
    return Array.from({ length: count }, () =>
      this.create(consumerService, contract, overrides),
    );
  }
}
