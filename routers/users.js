const express = require('express');
const { register, login, getMe,logout ,forgotPassword, resetPassword,updateDetails, updatePassword } = require('../controllers/users');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me',protect ,getMe);
router.put('/updateDetails',protect , updateDetails);
router.put('/updatePassword',protect , updatePassword);
router.post('/forgotPassword',forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);


module.exports = router;