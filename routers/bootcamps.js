const express = require('express');
const router = express.Router();

const { protect,authorize } = require('../middleware/auth');

const { getBootcamp,getBootcamps,createBootcamp,createBootcamps,updateBootcamp,deleteBootcamp,getBootcampsInRadius, bootcampPhotoUpload  } = require('../controllers/bootcamps')
const Bootcamps = require('../models/Bootcamps')
const advancedResults = require('../middleware/advancedResults')
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');



router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(protect,authorize('publisher','admin'),bootcampPhotoUpload);

router
     .route('/')
     .get(advancedResults(Bootcamps, 'courses'), getBootcamps)
     .post(protect,authorize('user','admin'),createBootcamps);

router
     .route('/:id')
     .get(getBootcamp)
     .put(protect,authorize('publisher','admin'),updateBootcamp)
     .delete(protect,authorize('publisher','admin'),deleteBootcamp);     


module.exports = router;