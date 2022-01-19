const express = require('express');
const router = express.Router();



const { getBootcamp,getBootcamps,createBootcamp,createBootcamps,updateBootcamp,deleteBootcamp,getBootcampsInRadius, bootcampPhotoUpload  } = require('../controllers/bootcamps')
const Bootcamps = require('../models/Bootcamps')
const advancedResults = require('../middleware/advancedResults')
const courseRouter = require('./courses');



router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(bootcampPhotoUpload);

router
     .route('/')
     .get(advancedResults(Bootcamps, 'courses'), getBootcamps)
     .post(createBootcamps);

router
     .route('/:id')
     .get(getBootcamp)
     .post(createBootcamp)
     .put(updateBootcamp)
     .delete(deleteBootcamp);     


module.exports = router;