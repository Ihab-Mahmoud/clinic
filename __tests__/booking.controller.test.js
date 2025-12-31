import { jest } from "@jest/globals";
import request from "supertest";

const TEST_USER_ID = "507f191e810c19729de860ea";

const mockBooking = {
  create: jest.fn(),
  aggregate: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

const mockTimeSlot = {
  findOneAndUpdate: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

const mockUser = {
  findById: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

jest.unstable_mockModule("../models/Appointment.js", () => ({
  default: mockBooking,
}));

jest.unstable_mockModule("../models/TimeSlots.js", () => ({
  default: mockTimeSlot,
}));

jest.unstable_mockModule("../models/User.js", () => ({
  default: mockUser,
}));

jest.unstable_mockModule("../middlewares/auth.js", () => ({
  authenticateUser: (req, _res, next) => {
    req.user = { userId: TEST_USER_ID };
    next();
  },
  authorizePermissions: () => (_req, _res, next) => next(),
}));

const { default: app } = await import("../app.js");

beforeAll(() => {
  global.emailQueue = { add: jest.fn() };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Booking routes", () => {
  it("creates a booking when the slot is available", async () => {
    mockTimeSlot.findOneAndUpdate.mockResolvedValue({
      _id: "slot-1",
      doctorId: "doctor-1",
      isBooked: true,
    });
    const bookingPayload = {
      _id: "booking-1",
      slotId: "slot-1",
      doctorId: "doctor-1",
      patientId: TEST_USER_ID,
    };
    mockBooking.create.mockResolvedValue(bookingPayload);

    const res = await request(app).post("/api/v1/booking").send({ slotId: "slot-1" });

    expect(res.status).toBe(200);
    expect(res.body.booking).toEqual(bookingPayload);
    expect(res.body.message).toBe("Booking successful!");
    expect(mockBooking.create).toHaveBeenCalledWith({
      patientId: TEST_USER_ID,
      slotId: "slot-1",
      doctorId: "doctor-1",
    });
  });

  it("returns 400 when the slot is already booked or missing", async () => {
    mockTimeSlot.findOneAndUpdate.mockResolvedValue(null);

    const res = await request(app).post("/api/v1/booking").send({ slotId: "slot-1" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Slot already booked or not found/i);
    expect(mockBooking.create).not.toHaveBeenCalled();
  });

  it("returns bookings list for the authenticated user", async () => {
    const slotStart = new Date().toISOString();
    mockBooking.aggregate.mockResolvedValue([
      { _id: "booking-1", slot: { startTime: slotStart }, user: { _id: TEST_USER_ID } },
    ]);
    mockBooking.countDocuments.mockResolvedValue(1);

    const res = await request(app).get("/api/v1/booking");

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/data fetched successfully/i);
    expect(res.body.totalBookings).toBe(1);
    expect(res.body.bookings).toHaveLength(1);
  });
});
