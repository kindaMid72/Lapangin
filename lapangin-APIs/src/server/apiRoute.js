import express from 'express';

// import all entry point for every request
import AvailabilityExceptionControllers from '../modules/availability/availabilityExceptionControllers.js';
import AvailabilityController from '../modules/availability/availabilityRulesControllers.js';
import CourtController from '../modules/courts/courtsControllers.js';
import UserVenuesController from '../modules/venues/userVenuesControllers.js';
import VanueController from '../modules/venues/venuesControllers.js';
import SlotAvailability from '../modules/courts/slotAvailability.js';
import TeamController from '../modules/team/teamControllers.js';
import AdminPayment from '../modules/payment/adminPaymentControllers.js';
import AdminBooking from '../modules/bookings/admin-booking.js';


// microsites
import CourtMicrositeController from '../modules/microsites/courtMicrositeControllers.js';
import AvaillabilityRules from '../modules/availability/availabilityRulesControllers.js';
import MicrositeBooking from '../modules/microsite-booking/microsite_booking.js'




const route = express.Router();

// admin dashboard
route.use('/venue', VanueController);
route.use('/user_venues', UserVenuesController);
route.use('/court', CourtController);
route.use('/availabilityRules', AvailabilityController);
route.use('/availabilityException', AvailabilityExceptionControllers);
route.use('/courtAvailability', SlotAvailability); // admin court
route.use('/team', TeamController);
// admin payment
route.use('/admin_payment', AdminPayment);
// admin booking
route.use('/admin_booking', AdminBooking);
// microsites (all request to these path will be available publicly)
route.use('/courtMicrosite', CourtMicrositeController); // microsite
route.use('/publicAvailability', AvaillabilityRules)
route.use('/microsite_booking', MicrositeBooking);


// TODO: venueCourt route entry point


export default route;