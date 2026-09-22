const request = require('supertest');
const app = require('../server');
const Activity = require('../models/Activity');
const Settings = require('../models/Settings');

// Mock Mongoose models for fast, deterministic unit/integration testing
jest.mock('../models/Activity');
jest.mock('../models/Settings');

describe('PlanetPulse Backend API Tests (Phase 2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health API (GET /api/health)', () => {
    test('GET /api/health returns 200 with { success: true, message: "PlanetPulse API is running" }', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'PlanetPulse API is running'
      });
    });
  });

  describe('404 Route Not Found Handling', () => {
    test('Unknown API route returns 404 with { success: false, message: "Route not found" }', async () => {
      const res = await request(app).get('/api/non-existent-endpoint');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Route not found'
      });
    });
  });

  describe('Activity Creation API (POST /api/activities)', () => {
    test('Creates activity with 10 travel km and determines unit="km" and co2=2.00', async () => {
      const mockCreated = {
        _id: '673f4b82d9a3b8112c3f81e1',
        type: 'travel',
        quantity: 10,
        unit: 'km',
        co2: 2,
        date: new Date('2026-09-22T00:00:00.000Z'),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      Activity.create.mockResolvedValue(mockCreated);

      const res = await request(app)
        .post('/api/activities')
        .send({
          type: 'travel',
          quantity: 10,
          date: '2026-09-22',
          unit: 'banana', // Untrusted client unit must be ignored
          co2: 999999     // Untrusted client co2 must be ignored
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('travel');
      expect(res.body.data.unit).toBe('km');
      expect(res.body.data.co2).toBe(2);

      // Verify Mongoose was called with backend-calculated unit & co2
      expect(Activity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'travel',
          quantity: 10,
          unit: 'km',
          co2: 2
        })
      );
    });

    test('Rejects missing activity type with 400', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({ quantity: 10, date: '2026-09-22' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Activity type is required');
    });

    test('Rejects unsupported activity type with 400', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({ type: 'rocket_ship', quantity: 10, date: '2026-09-22' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unsupported activity type');
    });

    test('Rejects missing quantity with 400', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({ type: 'travel', date: '2026-09-22' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Quantity is required');
    });

    test('Rejects zero, negative, and non-numeric quantity with 400', async () => {
      const zeroRes = await request(app).post('/api/activities').send({ type: 'bus', quantity: 0, date: '2026-09-22' });
      expect(zeroRes.status).toBe(400);

      const negRes = await request(app).post('/api/activities').send({ type: 'bus', quantity: -5, date: '2026-09-22' });
      expect(negRes.status).toBe(400);

      const strRes = await request(app).post('/api/activities').send({ type: 'bus', quantity: 'abc', date: '2026-09-22' });
      expect(strRes.status).toBe(400);
    });

    test('Rejects missing or invalid date with 400', async () => {
      const noDateRes = await request(app).post('/api/activities').send({ type: 'bus', quantity: 10 });
      expect(noDateRes.status).toBe(400);
      expect(noDateRes.body.message).toContain('Date is required');

      const badDateRes = await request(app).post('/api/activities').send({ type: 'bus', quantity: 10, date: 'invalid-date' });
      expect(badDateRes.status).toBe(400);
    });

    test('Accepts and records valid unusual input (DP2 preparation)', async () => {
      const mockCreated = {
        _id: '673f4b82d9a3b8112c3f81e2',
        type: 'flight',
        quantity: 500000,
        unit: 'km',
        co2: 125000,
        date: new Date('2026-09-22T00:00:00.000Z')
      };
      Activity.create.mockResolvedValue(mockCreated);

      const res = await request(app)
        .post('/api/activities')
        .send({ type: 'flight', quantity: 500000, date: '2026-09-22' });

      expect(res.status).toBe(201);
      expect(res.body.data.quantity).toBe(500000);
      expect(res.body.data.co2).toBe(125000);
    });
  });

  describe('Activity Retrieval & Filtering API (GET /api/activities)', () => {
    test('Returns list of activities sorted newest first', async () => {
      const mockList = [
        { _id: '1', type: 'flight', quantity: 100, unit: 'km', co2: 25, date: '2026-09-23T00:00:00.000Z' },
        { _id: '2', type: 'travel', quantity: 10, unit: 'km', co2: 2, date: '2026-09-22T00:00:00.000Z' }
      ];
      Activity.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockList)
        })
      });

      const res = await request(app).get('/api/activities');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toEqual(mockList);
    });

    test('Filters by activity type (e.g. ?type=travel)', async () => {
      const mockTravelOnly = [
        { _id: '2', type: 'travel', quantity: 10, unit: 'km', co2: 2, date: '2026-09-22T00:00:00.000Z' }
      ];
      Activity.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockTravelOnly)
        })
      });

      const res = await request(app).get('/api/activities?type=travel');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(Activity.find).toHaveBeenCalledWith(expect.objectContaining({ type: 'travel' }));
    });

    test('Filters by date range (e.g. ?from=2026-09-21&to=2026-09-27)', async () => {
      Activity.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([])
        })
      });

      const res = await request(app).get('/api/activities?from=2026-09-21&to=2026-09-27');
      expect(res.status).toBe(200);
      expect(Activity.find).toHaveBeenCalledWith(
        expect.objectContaining({
          date: expect.objectContaining({
            $gte: expect.any(Date),
            $lte: expect.any(Date)
          })
        })
      );
    });

    test('Rejects invalid date filter format', async () => {
      const res = await request(app).get('/api/activities?from=bad-date');
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid "from" date filter');
    });
  });

  describe('Single Activity API (GET /api/activities/:id)', () => {
    test('Returns 400 for invalid ObjectId format', async () => {
      const res = await request(app).get('/api/activities/123');
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid activity ID format');
    });

    test('Returns 404 if activity is not found', async () => {
      Activity.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const res = await request(app).get('/api/activities/507f1f77bcf86cd799439011');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Activity not found');
    });

    test('Returns single activity document when found', async () => {
      const mockDoc = {
        _id: '507f1f77bcf86cd799439011',
        type: 'electricity',
        quantity: 5,
        unit: 'kWh',
        co2: 4
      };
      Activity.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDoc)
      });

      const res = await request(app).get('/api/activities/507f1f77bcf86cd799439011');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockDoc);
    });
  });

  describe('Activity Deletion API (DELETE /api/activities/:id)', () => {
    test('Returns 400 for invalid ObjectId format', async () => {
      const res = await request(app).delete('/api/activities/not-a-valid-id');
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid activity ID format');
    });

    test('Returns 404 if activity to delete is not found', async () => {
      Activity.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app).delete('/api/activities/507f1f77bcf86cd799439011');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Activity not found');
    });

    test('Deletes activity and returns success', async () => {
      Activity.findByIdAndDelete.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });

      const res = await request(app).delete('/api/activities/507f1f77bcf86cd799439011');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');
    });
  });

  describe('Weekly Target API (GET & PUT /api/target)', () => {
    test('GET /api/target retrieves weekly target (defaults to 20)', async () => {
      Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });

      const res = await request(app).get('/api/target');
      expect(res.status).toBe(200);
      expect(res.body.data.weeklyTarget).toBe(20);
    });

    test('PUT /api/target updates target to 25 kg CO2', async () => {
      Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 25 });

      const res = await request(app).put('/api/target').send({ weeklyTarget: 25 });
      expect(res.status).toBe(200);
      expect(res.body.data.weeklyTarget).toBe(25);
    });

    test('PUT /api/target updates target to 30 kg CO2', async () => {
      Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 30 });

      const res = await request(app).put('/api/target').send({ weeklyTarget: 30 });
      expect(res.status).toBe(200);
      expect(res.body.data.weeklyTarget).toBe(30);
    });

    test('PUT /api/target rejects target = 0', async () => {
      const res = await request(app).put('/api/target').send({ weeklyTarget: 0 });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('greater than zero');
    });

    test('PUT /api/target rejects target < 0 (e.g. -5)', async () => {
      const res = await request(app).put('/api/target').send({ weeklyTarget: -5 });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('greater than zero');
    });

    test('PUT /api/target rejects non-numeric target', async () => {
      const res = await request(app).put('/api/target').send({ weeklyTarget: 'not-a-number' });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('greater than zero');
    });
  });
});
