import express from 'express';

const route = express.Router();

// TODO: api request goes here

route.post('/get_selected_date_exception', async (req, res) => {
    try{
        // this is a public request, there for, anyone can make a request to this endpoint
        /**
         * body:
         * - date (string)
         * - venueId (num)
         * -  courtId
         */
    }catch(err){
        console.error('error from availabilityException: ', err);
        return res.status(500).json({message: err.message});
    }
})




export default route;