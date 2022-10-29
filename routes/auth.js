const express = require('express');
const User = require('../models/User');
const router = express.Router(); 
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
//var token = jwt.sign({ foo: 'bar' }, 'shhhhh');

const JWT_SECRET='BhoomilDayani@11'

//Router : 1 Create a User using: POST "/api/auth/craeteUser". Doesn't require Auth
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
    const salt = await bcrypt.genSaltSync(10);
    secPasswd=await bcrypt.hash(req.body.password, salt);
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPasswd,
      })
      // .then(user => res.json(user))
      // .catch(err=>{console.log(err)
    
    const data={
      user:{
        id: user.id
      }
    }
    const AuthToken = jwt.sign(data, JWT_SECRET)
    res.json({AuthToken})
    
      } catch (error){
        console.error(error.message);
        res.status(500).send("Some error occured")
      }

} )


//Router : 2 login a User using: POST "/api/auth/login". Doesn't require Auth
router.post('/login', [
  body('email','Enter a vaild Email').isEmail(),  
  body('password','Password cab not be blank').exists(),  
], async(req, res)=>{
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email, password} = req.body;
    try {
      let user = await User.findOne({email});
      if(!user){
        return res.status(400).json({error: "Please try to login with correct credentials"})
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if(!passwordCompare){
        return res.status(400).json({error : "Plase Enter the correct password"});
      }
      const data={
        user:{
          id: user.id
        }
      }
      const AuthToken = jwt.sign(data, JWT_SECRET);
      res.json({AuthToken})

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
})

//Router : 3 Get Login User Details: POST "/api/auth/getuser". Login Required
router.post('/getuser', fetchuser, async(req, res)=>{
try {
  userId = req.user.id;
  const user = await User.findById(userId).select("-password")
  res.send(user)
} catch (error) {
  console.error(error.message);
    res.status(500).send("Internal server error");
}})
module.exports = router