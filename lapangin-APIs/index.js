// apis entry point
/**
 * 
 */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();
// request route
import route from './src/server/apiRoute.js';

const app = express();
const port = process.env.PORT;

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true, 
};

app.use(cors(
    corsOptions
));
app.use(bodyParser.json());

// custom entry point for every request
app.use('/', route);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});