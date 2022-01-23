const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require("../middleware/async");
const Users = require("../models/Users");
const sendEmail = require('../utils/sendEmails');
const crypto = require('crypto');




exports.register = asyncHandler(async (req,res,next) => {
    const { name,email,password,role } = req.body;

    const user = await Users.create({
        name,
        email,
        password,
        role
    });

    const token = user.getSignedJwtToken();

    res.status(200).json({ success: true, token: token });
})

exports.login = asyncHandler(async (req,res,next) => {
    const { email,password } = req.body;

   if(!email || !password) {
       return next(new ErrorResponse('Please provide an email and password',400));
   }

   const user = await Users.findOne({ email }).select('+password');

   if(!user) {
    return next(new ErrorResponse('Invalid credentials',401));
    
   }

   const isMatch = await user.matchPassword(password);

   if(!isMatch) {
       return next(new ErrorResponse('Invalid credentials',401));
   }

    sendTokenResponse(user,200,res);
})

exports.logout = asyncHandler(async (req,res,next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10* 1000),
    httpOnly: true
  })

  res.status(200).json({
      success: true,
      data: {}
  })
})



exports.getMe = asyncHandler(async (req,res,next) => {
    const user = await Users.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    })
})

exports.updateDetails = asyncHandler(async (req,res,next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  }


  const user = await Users.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
      success: true,
      data: user
  })
})

exports.updatePassword = asyncHandler(async (req,res,next) => {
  const user = await Users.findById(req.user.id).select('+password');


  if(!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
})





exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await Users.findOne({ email: req.body.email });
  
    if (!user) {
      return next(new ErrorResponse('There is no user with that email', 404));
    }
  
    // Get reset token
    const resetToken = user.getResetPasswordToken();

    // console.log(resetToken);


  
    await user.save({ validateBeforeSave: false });
  
    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/resetpassword/${resetToken}`;
  
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
  
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message,
      });
  
      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
  
      await user.save({ validateBeforeSave: false });
  
      return next(new ErrorResponse('Email could not be sent', 500));
    }
    res.status(200).json({
        success: true,
        data: user
    })
})

exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');
  
    const user = await Users.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  
    if (!user) {
      return next(new ErrorResponse('Invalid token', 400));
    }
  
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
  
    sendTokenResponse(user, 200, res);
  });
  

const sendTokenResponse = (user,statusCode, res) => {

    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly :  true
    };

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res
       .status(statusCode)
       .cookie('token', token, options)
       .json({
           success: true,
           token
       });
}