const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const config = require('config');

// @route  POST api/users
// @desc   register user
// @access  public
router.post('/', [
    body('name', 'name is required').not().isEmpty(),
    body('email', 'please include a valid email').isEmail(),
    body('password', 'please enter a password with 6 or more characters').isLength({ min: 6})
], async (req, res) => {
    //console.log(req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try{

        let user = await User.findOne({ email });

        if(user){
            res.status(400).json({ errors: [{ msg: 'user already exixts'}] });
        }

        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })


        user = new User({
            name,
            email,
            avatar,
            password
        });

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

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
