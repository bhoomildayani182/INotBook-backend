const express = require('express');
const User = require('../models/User');
const router = express.Router(); 
const { body, validationResult } = require('express-validator');



// Create a User using: POST "/api/auth/craeteUser". Doesn't require Auth
router.post('/craeteUser', [
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
    
], async(req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //check use/email already available or not 
    try{
    let user=await User.findOne({email: req.body.email});
    if(user){
      return res.status(400).json({error:"Sorry user alredy exists"})
    }
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      }).then(user => res.json(user))
      .catch(err=>{console.log(err)
    res.json({error:"Enter a unique value for email",message: err.message})})
      } catch (error){
        console.error(error.message);
        res.status(500).send("Some error occured")
      }

} )

module.exports = router