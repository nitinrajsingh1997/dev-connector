const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route  GET api/auth
// @desc Test Route
// @access  public
router.get('/', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error'); 
    }
})


// @route  POST api/auth
// @desc   authenticate user & get token
// @access  public
router.post('/', [
    body('email', 'please include a valid email').isEmail(),
    body('password', 'password is required').exists()
], async (req, res) => {
    //console.log(req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try{

        let user = await User.findOne({ email });

        if(!user){
            res.status(400).json({ errors: [{ msg: 'invalid credentials'}] });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            res.status(400).json({ errors: [{ msg: 'invalid credentials'}] });
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: "10h" }, 
        (err, token) => {
            if(err)  throw err;
            res.json({ token });
        });

    } catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
})


module.exports = router;
