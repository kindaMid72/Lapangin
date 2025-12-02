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


// microsites
import CourtMicrositeController from '../modules/microsites/courtMicrositeControllers.js';
import AvaillabilityRules from '../modules/availability/availabilityRulesControllers.js'




const route = express.Router();

// admin dashboard
route.use('/venue', VanueController);
route.use('/user_venues', UserVenuesController);
route.use('/court', CourtController);
route.use('/availabilityRules', AvailabilityController);
route.use('/availabilityException', AvailabilityExceptionControllers);
route.use('/courtAvailability', SlotAvailability);
route.use('/team', TeamController);
// admin payment
route.use('/admin_payment', AdminPayment);

// microsites (all request to these path will be available publicly)
route.use('/courtMicrosite', CourtMicrositeController);
route.use('/publicAvailability', AvaillabilityRules)


// TODO: venueCourt route entry point


export default route;