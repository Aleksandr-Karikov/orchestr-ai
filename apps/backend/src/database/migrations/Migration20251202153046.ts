import { Migration } from "@mikro-orm/migrations";

export class Migration20251202153046 extends Migration {
  async up(): Promise<void> {
    // Create ENUM types
    this.addSql(`
      CREATE TYPE "indexing_status" AS ENUM ('pending', 'in_progress', 'completed', 'failed');
      CREATE TYPE "source_type" AS ENUM ('annotation', 'openapi', 'manual', 'llm', 'hybrid');
      CREATE TYPE "usage_type" AS ENUM ('direct_call', 'indirect', 'manual');
      CREATE TYPE "detection_method" AS ENUM ('code_analysis', 'config', 'manual');
    `);

    // Create systems table
    this.addSql(`
      CREATE TABLE "systems" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create services table
    this.addSql(`
      CREATE TABLE "services" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "system_id" UUID NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "repository_url" VARCHAR(500) NOT NULL,
        "repository_path" VARCHAR(500),
        "last_indexed_at" TIMESTAMP,
        "indexing_status" "indexing_status" NOT NULL DEFAULT 'pending',
        "metadata" JSONB,
        CONSTRAINT "services_system_id_foreign" FOREIGN KEY ("system_id") REFERENCES "systems"("id") ON DELETE CASCADE
      );
    `);

    // Create contracts table (without current_version_id FK initially)
    this.addSql(`
      CREATE TABLE "contracts" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "service_id" UUID NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "http_method" VARCHAR(10) NOT NULL,
        "path" VARCHAR(500) NOT NULL,
        "request_schema" JSONB,
        "response_schema" JSONB,
        "parameters" JSONB,
        "source_type" "source_type" NOT NULL DEFAULT 'manual',
        "source_file" VARCHAR(500),
        "source_line" INTEGER,
        "extraction_confidence" DECIMAL(3,2),
        "current_version_id" UUID,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "contracts_service_id_foreign" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE
      );
    `);

    // Create contract_versions table
    this.addSql(`
      CREATE TABLE "contract_versions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "contract_id" UUID NOT NULL,
        "version" INTEGER NOT NULL,
        "snapshot" JSONB NOT NULL,
        "change_summary" TEXT,
        "is_current" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "created_by" VARCHAR(255),
        CONSTRAINT "contract_versions_contract_id_foreign" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE
      );
    `);

    // Create service_contract_usage table
    this.addSql(`
      CREATE TABLE "service_contract_usage" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "consumer_service_id" UUID NOT NULL,
        "contract_id" UUID NOT NULL,
        "contract_version_id" UUID,
        "usage_type" "usage_type" NOT NULL DEFAULT 'manual',
        "detection_method" "detection_method" NOT NULL DEFAULT 'manual',
        "detected_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "confidence" DECIMAL(3,2),
        CONSTRAINT "service_contract_usage_consumer_service_id_foreign" FOREIGN KEY ("consumer_service_id") REFERENCES "services"("id") ON DELETE CASCADE,
        CONSTRAINT "service_contract_usage_contract_id_foreign" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE,
        CONSTRAINT "service_contract_usage_contract_version_id_foreign" FOREIGN KEY ("contract_version_id") REFERENCES "contract_versions"("id") ON DELETE SET NULL
      );
    `);

    // Create B-Tree indexes
    this.addSql(`
      CREATE INDEX "systems_name_index" ON "systems" ("name");
      CREATE INDEX "services_system_id_index" ON "services" ("system_id");
      CREATE INDEX "services_repository_url_index" ON "services" ("repository_url");
      CREATE INDEX "contracts_service_id_index" ON "contracts" ("service_id");
      CREATE INDEX "contracts_http_method_path_index" ON "contracts" ("http_method", "path");
      CREATE INDEX "contract_versions_contract_id_index" ON "contract_versions" ("contract_id");
      CREATE INDEX "contract_versions_contract_id_version_index" ON "contract_versions" ("contract_id", "version");
      CREATE INDEX "contract_versions_is_current_index" ON "contract_versions" ("is_current");
      CREATE INDEX "service_contract_usage_consumer_service_id_contract_id_index" ON "service_contract_usage" ("consumer_service_id", "contract_id");
      CREATE INDEX "service_contract_usage_consumer_service_id_index" ON "service_contract_usage" ("consumer_service_id");
      CREATE INDEX "service_contract_usage_contract_id_index" ON "service_contract_usage" ("contract_id");
    `);

    // Add foreign key constraint from contracts to contract_versions (after contract_versions is created)
    this.addSql(`
      ALTER TABLE "contracts" ADD CONSTRAINT "contracts_current_version_id_foreign" FOREIGN KEY ("current_version_id") REFERENCES "contract_versions"("id") ON DELETE SET NULL;
    `);

    // Create GIN indexes for JSONB fields
    this.addSql(`
      CREATE INDEX "services_metadata_gin_index" ON "services" USING GIN ("metadata");
      CREATE INDEX "contracts_request_schema_gin_index" ON "contracts" USING GIN ("request_schema");
      CREATE INDEX "contracts_response_schema_gin_index" ON "contracts" USING GIN ("response_schema");
      CREATE INDEX "contracts_parameters_gin_index" ON "contracts" USING GIN ("parameters");
      CREATE INDEX "contract_versions_snapshot_gin_index" ON "contract_versions" USING GIN ("snapshot");
    `);
  }

  async down(): Promise<void> {
    // Drop indexes first
    this.addSql(`
      DROP INDEX IF EXISTS "services_metadata_gin_index";
      DROP INDEX IF EXISTS "contracts_request_schema_gin_index";
      DROP INDEX IF EXISTS "contracts_response_schema_gin_index";
      DROP INDEX IF EXISTS "contracts_parameters_gin_index";
      DROP INDEX IF EXISTS "contract_versions_snapshot_gin_index";
      DROP INDEX IF EXISTS "service_contract_usage_contract_id_index";
      DROP INDEX IF EXISTS "service_contract_usage_consumer_service_id_index";
      DROP INDEX IF EXISTS "service_contract_usage_consumer_service_id_contract_id_index";
      DROP INDEX IF EXISTS "contract_versions_is_current_index";
      DROP INDEX IF EXISTS "contract_versions_contract_id_version_index";
      DROP INDEX IF EXISTS "contract_versions_contract_id_index";
      DROP INDEX IF EXISTS "contracts_http_method_path_index";
      DROP INDEX IF EXISTS "contracts_service_id_index";
      DROP INDEX IF EXISTS "services_repository_url_index";
      DROP INDEX IF EXISTS "services_system_id_index";
      DROP INDEX IF EXISTS "systems_name_index";
    `);

    // Drop tables (in reverse order due to foreign keys)
    this.addSql(`
      DROP TABLE IF EXISTS "service_contract_usage";
      DROP TABLE IF EXISTS "contract_versions";
      DROP TABLE IF EXISTS "contracts";
      DROP TABLE IF EXISTS "services";
      DROP TABLE IF EXISTS "systems";
    `);

    // Drop ENUM types
    this.addSql(`
      DROP TYPE IF EXISTS "detection_method";
      DROP TYPE IF EXISTS "usage_type";
      DROP TYPE IF EXISTS "source_type";
      DROP TYPE IF EXISTS "indexing_status";
    `);
  }
}
