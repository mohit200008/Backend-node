const path = require('path');
const asyncHandler = require("../middleware/async");
const Bootcamps = require("../models/Bootcamps");
const ErrorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geocoder");

exports.getBootcamps= asyncHandler(async(req,res,next) => {

   
  
    res
       .status(200)
       .json(res.advancedResults);
});

exports.getBootcamp = (async(req,res,next)=> {
    const bootcamp = await Bootcamps.findById(req.params.id);

    if(!bootcamp) {      
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404)); 
    }
    res.status(200).json({ success:true, data: bootcamp });
});

exports.createBootcamps = asyncHandler(async(req,res,next) => {
        req.body.user = req.user.id;

        const publishedBootcamp = await Bootcamps.findOne({ user: req.user.id });

        if(publishedBootcamp && req.user.role !== 'admin'){
            return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`,400));
        }
        const bootcamp = await Bootcamps.create(req.body);

        res.status(200).json({ success:true, data: bootcamp }); 
});

exports.createBootcamp = (req,res,next) => {
    res.status(200).json({ success:true, msg: `Create new bootcamp with id ${req.params.id}` });
}

exports.updateBootcamp = asyncHandler(async(req,res,next) => {
    let bootcamp = await Bootcamps.findById(req.params.id);

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));         
    }

    if(bootcamp.user.toString() !== req.user.id ||  req.user.role !=='admin') {
        return next(new ErrorResponse(`${req.user.id} is not authorized to update this bootcamp`,401));         
    }

    bootcamp = await Bootcamps.findOneAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success:true, data: bootcamp });
})

exports.deleteBootcamp = asyncHandler(async(req,res,next) => {
    const bootcamp = await Bootcamps.findById(req.params.id);

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404)); 
        
    }

    if(bootcamp.user.toString() !== req.user.id ||  req.user.role !=='admin') {
        return next(new ErrorResponse(`${req.user.id} is not authorized to delete this bootcamp`,401));         
    }

    bootcamp.remove();

    res.status(200).json({ success:true, data:{} });
})


exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;
  
    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;
  
    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;
  
    const bootcamps = await Bootcamps.find({
      location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });
  
    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    });
  });


  exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamps.findById(req.params.id);
  
    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
    }
  
   
  
    if (!req.files) {
      return next(new ErrorResponse(`Please upload a file`, 400));
    }
  
    const file = req.files.file;
  
    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse(`Please upload an image file`, 400));
    }
  
    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
          400
        )
      );
    }
  
    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
      }
  
      await Bootcamps.findByIdAndUpdate(req.params.id, { photo: file.name });
  
      res.status(200).json({
        success: true,
        data: file.name
      });
    });
  });