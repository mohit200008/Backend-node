const express = require('express');
const dotenv = require('dotenv');
const logger = require('./middleware/logger');
const bootcamps = require('./routers/bootcamps');
const courses = require('./routers/courses');
const users = require('./routers/users');
const admins = require('./routers/admin');
const reviews = require('./routers/reviews');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const monogoSanitize = require('express-mongo-sanitize')
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');


dotenv.config({ path: './config/config.env' });

connectDB();

const app = express();

app.use(express.json());

app.use(cookieParser());

// if (process.env.NODE_ENV === 'development'){
//     app.use(morgan('dev'));
// }

// app.use(logger);

app.use(fileupload());


app.use(monogoSanitize());

app.use(helmet());

app.use(xss());

const limiter = rateLimit({
    windowMs: 10*60*1000,
    max: 100
})
app.use(limiter);

app.use(hpp());

app.use(cors());


app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses',courses);
app.use('/api/v1/users',users);
app.use('/api/v1/admins',admins);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, ()=> {
    console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`)
});

process.on('unhandledRejection',(err,promise) => {
    console.log(`Error: ${err.message}`);

    server.close(() => process.exit(1));
})