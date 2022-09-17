const express = require('express');
const User = require('../models/User');
const router = express.Router(); 
const { body, validationResult } = require('express-validator');



// Create a User using: POST "/api/auth/". Doesn't require Auth
router.post('/', [
    body('name','Enter a valid Name').isLength({ min: 5 }),
    // body('passwordConfirmation').custom((value, { req }) => {
    //     if (value !== req.body.password) {
    //       throw new Error('Password confirmation does not match password');
    //     }
    
    //     // Indicates the success of this synchronous custom validator
    //     return true;
    //   }),  This for password conformation
    body('email','Enter a vaild Email').isEmail(),
    body('password','Password must be atleast 5 characters ').isLength({ min: 5 }),
    
], (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      }).then(user => res.json(user))
      .catch(err=>{console.log(err)
    res.json({error:"Enter a unique value for email",message: err.message})});
} )

module.exports = router