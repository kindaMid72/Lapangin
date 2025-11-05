import express from 'express';

// import all entry point for every request
import VanueController from '../modules/venues/venuesControllers.js';
import UserVenuesController from '../modules/venues/userVenuesControllers.js';
import CourtController from '../modules/courts/courtsControllers.js';



const route = express.Router();

// set entry point down here
route.use('/venue', VanueController);
route.use('/user_venues', UserVenuesController);
route.use('/court', CourtController);
    // TODO: venueCourt route entry point


export default route;