import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getEmFromApp, cleanupDatabase } from './test-setup';
import { EntityManager } from '@mikro-orm/core';

// NOTE: These tests are ready but will fail until controllers are implemented
// Once ContractsController has POST, GET, PUT, DELETE endpoints, remove .skip
describe.skip('ContractsController (e2e)', () => {
  let app: INestApplication;
  let em: EntityManager;
  let systemId: string;
  let serviceId: string;

  beforeAll(async () => {
    app = await createTestApp();
    em = getEmFromApp(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await cleanupDatabase(em);

    // Create a test system and service for contract tests
    const systemResponse = await request(app.getHttpServer())
      .post('/api/systems')
      .send({ name: 'Test System', description: 'Test system for contracts' });
    systemId = systemResponse.body.id;

    const serviceResponse = await request(app.getHttpServer())
      .post('/api/services')
      .send({
        system_id: systemId,
        name: 'Test Service',
        repository_url: 'https://github.com/example/test-service',
      });
    serviceId = serviceResponse.body.id;
  });

  describe('POST /api/contracts', () => {
    it('should create a new contract', async () => {
      const createContractDto = {
        service_id: serviceId,
        name: 'Get User',
        http_method: 'GET',
        path: '/api/users/:id',
        request_schema: { type: 'object', properties: { id: { type: 'string' } } },
        response_schema: { type: 'object', properties: { user: { type: 'object' } } },
        parameters: { id: { type: 'path', required: true } },
        source_type: 'manual',
        source_file: 'src/routes/users.ts',
        source_line: 10,
        extraction_confidence: 0.95,
      };

      const response = await request(app.getHttpServer())
        .post('/api/contracts')
        .send(createContractDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createContractDto.name);
      expect(response.body.http_method).toBe(createContractDto.http_method);
      expect(response.body.path).toBe(createContractDto.path);
      expect(response.body.service_id).toBe(serviceId);
      expect(response.body.request_schema).toEqual(createContractDto.request_schema);
      expect(response.body.response_schema).toEqual(createContractDto.response_schema);
    });

    it('should create a contract with minimal fields', async () => {
      const createContractDto = {
        service_id: serviceId,
        name: 'Simple Contract',
        http_method: 'GET',
        path: '/api/simple',
        source_type: 'manual',
      };

      const response = await request(app.getHttpServer())
        .post('/api/contracts')
        .send(createContractDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createContractDto.name);
    });

    it('should return 400 when required fields are missing', async () => {
      const createContractDto = {
        name: 'Test Contract',
        // Missing service_id, http_method, path, source_type
      };

      await request(app.getHttpServer())
        .post('/api/contracts')
        .send(createContractDto)
        .expect(400);
    });

    it('should return 404 when service_id does not exist', async () => {
      const nonExistentServiceId = '00000000-0000-0000-0000-000000000000';
      const createContractDto = {
        service_id: nonExistentServiceId,
        name: 'Test Contract',
        http_method: 'GET',
        path: '/api/test',
        source_type: 'manual',
      };

      await request(app.getHttpServer())
        .post('/api/contracts')
        .send(createContractDto)
        .expect(404);
    });
  });

  describe('GET /api/contracts', () => {
    it('should return an empty array when no contracts exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contracts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return all contracts', async () => {
      // Create test contracts
      const contract1 = {
        service_id: serviceId,
        name: 'Contract 1',
        http_method: 'GET',
        path: '/api/contract-1',
        source_type: 'manual',
      };
      const contract2 = {
        service_id: serviceId,
        name: 'Contract 2',
        http_method: 'POST',
        path: '/api/contract-2',
        source_type: 'manual',
      };

      await request(app.getHttpServer()).post('/api/contracts').send(contract1);
      await request(app.getHttpServer()).post('/api/contracts').send(contract2);

      const response = await request(app.getHttpServer())
        .get('/api/contracts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should filter contracts by service_id', async () => {
      // Create another service
      const service2Response = await request(app.getHttpServer())
        .post('/api/services')
        .send({
          system_id: systemId,
          name: 'Service 2',
          repository_url: 'https://github.com/example/service-2',
        });
      const service2Id = service2Response.body.id;

      // Create contracts in different services
      await request(app.getHttpServer())
        .post('/api/contracts')
        .send({
          service_id: serviceId,
          name: 'Contract in Service 1',
          http_method: 'GET',
          path: '/api/contract-1',
          source_type: 'manual',
        });
      await request(app.getHttpServer())
        .post('/api/contracts')
        .send({
          service_id: service2Id,
          name: 'Contract in Service 2',
          http_method: 'GET',
          path: '/api/contract-2',
          source_type: 'manual',
        });

      const response = await request(app.getHttpServer())
        .get(`/api/contracts?service_id=${serviceId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].service_id).toBe(serviceId);
    });
  });

  describe('GET /api/contracts/:id', () => {
    it('should return a contract by id', async () => {
      const createContractDto = {
        service_id: serviceId,
        name: 'Test Contract',
        http_method: 'GET',
        path: '/api/test',
        source_type: 'manual',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/contracts')
        .send(createContractDto)
        .expect(201);

      const contractId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/api/contracts/${contractId}`)
        .expect(200);

      expect(response.body.id).toBe(contractId);
      expect(response.body.name).toBe(createContractDto.name);
      expect(response.body.http_method).toBe(createContractDto.http_method);
    });

    it('should return 404 when contract does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(`/api/contracts/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('PUT /api/contracts/:id', () => {
    it('should update a contract', async () => {
      const createContractDto = {
        service_id: serviceId,
        name: 'Original Contract',
        http_method: 'GET',
        path: '/api/original',
        source_type: 'manual',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/contracts')
        .send(createContractDto)
        .expect(201);

      const contractId = createResponse.body.id;

      const updateContractDto = {
        name: 'Updated Contract',
        http_method: 'POST',
        path: '/api/updated',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/contracts/${contractId}`)
        .send(updateContractDto)
        .expect(200);

      expect(response.body.id).toBe(contractId);
      expect(response.body.name).toBe(updateContractDto.name);
      expect(response.body.http_method).toBe(updateContractDto.http_method);
      expect(response.body.path).toBe(updateContractDto.path);
    });

    it('should return 404 when contract does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateContractDto = {
        name: 'Updated Contract',
      };

      await request(app.getHttpServer())
        .put(`/api/contracts/${nonExistentId}`)
        .send(updateContractDto)
        .expect(404);
    });
  });

  describe('DELETE /api/contracts/:id', () => {
    it('should delete a contract', async () => {
      const createContractDto = {
        service_id: serviceId,
        name: 'Contract to Delete',
        http_method: 'GET',
        path: '/api/to-delete',
        source_type: 'manual',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/contracts')
        .send(createContractDto)
        .expect(201);

      const contractId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/api/contracts/${contractId}`)
        .expect(200);

      // Verify contract is deleted
      await request(app.getHttpServer())
        .get(`/api/contracts/${contractId}`)
        .expect(404);
    });

    it('should return 404 when contract does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .delete(`/api/contracts/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('POST /api/contracts/:id/versions', () => {
    it('should create a contract version', async () => {
      const createContractDto = {
        service_id: serviceId,
        name: 'Test Contract',
        http_method: 'GET',
        path: '/api/test',
        source_type: 'manual',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/contracts')
        .send(createContractDto)
        .expect(201);

      const contractId = createResponse.body.id;

      const createVersionDto = {
        contract_id: contractId,
        snapshot: {
          name: 'Test Contract',
          http_method: 'GET',
          path: '/api/test',
          request_schema: { type: 'object' },
        },
        change_summary: 'Initial version',
        created_by: 'test-user',
      };

      const response = await request(app.getHttpServer())
        .post(`/api/contracts/${contractId}/versions`)
        .send(createVersionDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.contract_id).toBe(contractId);
      expect(response.body.snapshot).toEqual(createVersionDto.snapshot);
      expect(response.body.change_summary).toBe(createVersionDto.change_summary);
    });

    it('should return 404 when contract does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const createVersionDto = {
        contract_id: nonExistentId,
        snapshot: { name: 'Test' },
      };

      await request(app.getHttpServer())
        .post(`/api/contracts/${nonExistentId}/versions`)
        .send(createVersionDto)
        .expect(404);
    });
  });
});

