import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getEmFromApp, cleanupDatabase } from './test-setup';
import { EntityManager } from '@mikro-orm/core';

// NOTE: These tests are ready but will fail until controllers are implemented
// Once ServicesController has POST, GET, PUT, DELETE endpoints, remove .skip
describe.skip('ServicesController (e2e)', () => {
  let app: INestApplication;
  let em: EntityManager;
  let systemId: string;

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

    // Create a test system for service tests
    const systemResponse = await request(app.getHttpServer())
      .post('/api/systems')
      .send({ name: 'Test System', description: 'Test system for services' });
    systemId = systemResponse.body.id;
  });

  describe('POST /api/services', () => {
    it('should create a new service', async () => {
      const createServiceDto = {
        system_id: systemId,
        name: 'Test Service',
        repository_url: 'https://github.com/example/test-service',
        metadata: { language: 'typescript', framework: 'nestjs' },
      };

      const response = await request(app.getHttpServer())
        .post('/api/services')
        .send(createServiceDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createServiceDto.name);
      expect(response.body.repository_url).toBe(createServiceDto.repository_url);
      expect(response.body.system_id).toBe(systemId);
      expect(response.body.metadata).toEqual(createServiceDto.metadata);
      expect(response.body).toHaveProperty('indexing_status');
    });

    it('should create a service without metadata', async () => {
      const createServiceDto = {
        system_id: systemId,
        name: 'Test Service Without Metadata',
        repository_url: 'https://github.com/example/test-service-2',
      };

      const response = await request(app.getHttpServer())
        .post('/api/services')
        .send(createServiceDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createServiceDto.name);
    });

    it('should return 400 when required fields are missing', async () => {
      const createServiceDto = {
        name: 'Test Service',
        // Missing system_id and repository_url
      };

      await request(app.getHttpServer())
        .post('/api/services')
        .send(createServiceDto)
        .expect(400);
    });

    it('should return 404 when system_id does not exist', async () => {
      const nonExistentSystemId = '00000000-0000-0000-0000-000000000000';
      const createServiceDto = {
        system_id: nonExistentSystemId,
        name: 'Test Service',
        repository_url: 'https://github.com/example/test-service',
      };

      await request(app.getHttpServer())
        .post('/api/services')
        .send(createServiceDto)
        .expect(404);
    });
  });

  describe('GET /api/services', () => {
    it('should return an empty array when no services exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/services')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return all services', async () => {
      // Create test services
      const service1 = {
        system_id: systemId,
        name: 'Service 1',
        repository_url: 'https://github.com/example/service-1',
      };
      const service2 = {
        system_id: systemId,
        name: 'Service 2',
        repository_url: 'https://github.com/example/service-2',
      };

      await request(app.getHttpServer()).post('/api/services').send(service1);
      await request(app.getHttpServer()).post('/api/services').send(service2);

      const response = await request(app.getHttpServer())
        .get('/api/services')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should filter services by system_id', async () => {
      // Create another system
      const system2Response = await request(app.getHttpServer())
        .post('/api/systems')
        .send({ name: 'System 2' });
      const system2Id = system2Response.body.id;

      // Create services in different systems
      await request(app.getHttpServer())
        .post('/api/services')
        .send({
          system_id: systemId,
          name: 'Service in System 1',
          repository_url: 'https://github.com/example/service-1',
        });
      await request(app.getHttpServer())
        .post('/api/services')
        .send({
          system_id: system2Id,
          name: 'Service in System 2',
          repository_url: 'https://github.com/example/service-2',
        });

      const response = await request(app.getHttpServer())
        .get(`/api/services?system_id=${systemId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].system_id).toBe(systemId);
    });
  });

  describe('GET /api/services/:id', () => {
    it('should return a service by id', async () => {
      const createServiceDto = {
        system_id: systemId,
        name: 'Test Service',
        repository_url: 'https://github.com/example/test-service',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/services')
        .send(createServiceDto)
        .expect(201);

      const serviceId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/api/services/${serviceId}`)
        .expect(200);

      expect(response.body.id).toBe(serviceId);
      expect(response.body.name).toBe(createServiceDto.name);
      expect(response.body.repository_url).toBe(createServiceDto.repository_url);
    });

    it('should return 404 when service does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(`/api/services/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('PUT /api/services/:id', () => {
    it('should update a service', async () => {
      const createServiceDto = {
        system_id: systemId,
        name: 'Original Service',
        repository_url: 'https://github.com/example/original-service',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/services')
        .send(createServiceDto)
        .expect(201);

      const serviceId = createResponse.body.id;

      const updateServiceDto = {
        name: 'Updated Service',
        repository_url: 'https://github.com/example/updated-service',
        metadata: { updated: true },
      };

      const response = await request(app.getHttpServer())
        .put(`/api/services/${serviceId}`)
        .send(updateServiceDto)
        .expect(200);

      expect(response.body.id).toBe(serviceId);
      expect(response.body.name).toBe(updateServiceDto.name);
      expect(response.body.repository_url).toBe(updateServiceDto.repository_url);
    });

    it('should return 404 when service does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateServiceDto = {
        name: 'Updated Service',
      };

      await request(app.getHttpServer())
        .put(`/api/services/${nonExistentId}`)
        .send(updateServiceDto)
        .expect(404);
    });
  });

  describe('DELETE /api/services/:id', () => {
    it('should delete a service', async () => {
      const createServiceDto = {
        system_id: systemId,
        name: 'Service to Delete',
        repository_url: 'https://github.com/example/service-to-delete',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/services')
        .send(createServiceDto)
        .expect(201);

      const serviceId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/api/services/${serviceId}`)
        .expect(200);

      // Verify service is deleted
      await request(app.getHttpServer())
        .get(`/api/services/${serviceId}`)
        .expect(404);
    });

    it('should return 404 when service does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .delete(`/api/services/${nonExistentId}`)
        .expect(404);
    });
  });
});

