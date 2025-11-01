import express from 'express';

// TODO: import all entry point for every request
import VanueController from '../modules/venues/venuesControllers.js';
import UserVenuesController from '../modules/venues/userVenuesControllers.js';


const route = express.Router();

// TODO: set entry point down here
route.use('/venue', VanueController);
route.use('/user_venues', UserVenuesController);


export default route;