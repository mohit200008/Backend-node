const express = require('express');
const dotenv = require('dotenv');
const logger = require('./middleware/logger');
const bootcamps = require('./routers/bootcamps');
const courses = require('./routers/courses');
const fileupload = require('express-fileupload');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');


dotenv.config({ path: './config/config.env' });

connectDB();

const app = express();

app.use(express.json());

// if (process.env.NODE_ENV === 'development'){
//     app.use(morgan('dev'));
// }

// app.use(logger);

app.use(fileupload());

app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses',courses);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, ()=> {
    console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`)
});

process.on('unhandledRejection',(err,promise) => {
    console.log(`Error: ${err.message}`);

    server.close(() => process.exit(1));
})