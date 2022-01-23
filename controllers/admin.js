const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require("../middleware/async");
const Users = require("../models/Users");



exports.getUsers = asyncHandler(async (req,res,next) => {
    res.status(200).json(res.advancedResults);
});


exports.getUser = asyncHandler(async (req,res,next) => {
    const user = await Users.findById(req.params.id);

    res.status(200).json({
        success: true,
        data: user
    })
});


exports.createUser = asyncHandler(async (req,res,next) => {
    const user = await Users.create(req.body);

    res.status(201).json({
        success: true,
        data: user
    })
});

exports.updateUser = asyncHandler(async (req,res,next) => {
    const user = await Users.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    })
});


exports.deleteUser = asyncHandler(async (req,res,next) => {
    await Users.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        data: {}
    })
});