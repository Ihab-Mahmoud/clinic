import express from "express";
const router = express();
import { authenticateUser, authorizePermissions } from "../middlewares/auth.js";

import {
  createBooking,
  deleteBooking,
  getAllBookings,
  getSingleBooking,
  EditBooking,
} from "../controllers/Booking-controller.js";

router.use(authenticateUser);

router.route("/").get(getAllBookings).post(createBooking);

router.route("/:id").get(getSingleBooking).patch(EditBooking).delete(deleteBooking);

export default router;

