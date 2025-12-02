import { ContractVersion } from "../../src/database/entities/contract-version.entity";
import { Contract } from "../../src/database/entities/contract.entity";

/**
 * Factory for creating test ContractVersion entities
 */
export class ContractVersionFactory {
  /**
   * Creates a ContractVersion entity with default or custom values
   */
  static create(
    contract: Contract,
    version: number,
    overrides?: Partial<ContractVersion>,
  ): ContractVersion {
    const contractVersion = new ContractVersion();
    contractVersion.contract = contract;
    contractVersion.version = version;
    contractVersion.snapshot =
      overrides?.snapshot ||
      JSON.parse(
        JSON.stringify({
          name: contract.name,
          http_method: contract.http_method,
          path: contract.path,
          request_schema: contract.request_schema,
          response_schema: contract.response_schema,
          parameters: contract.parameters,
        }),
      );
    contractVersion.change_summary = overrides?.change_summary;
    contractVersion.is_current = overrides?.is_current ?? false;
    contractVersion.created_at = overrides?.created_at || new Date();
    contractVersion.created_by = overrides?.created_by;

    if (overrides?.id) {
      contractVersion.id = overrides.id;
    }

    return contractVersion;
  }

  /**
   * Creates multiple ContractVersion entities for the same contract
   */
  static createMany(
    contract: Contract,
    versions: number[],
    overrides?: Partial<ContractVersion>,
  ): ContractVersion[] {
    return versions.map((version) => this.create(contract, version, overrides));
  }
}
