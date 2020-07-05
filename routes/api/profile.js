const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth'); 
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
const { body, validationResult } = require('express-validator');
const { response } = require('express');

// @route  GET api/profile/me
// @desc get current user profile
// @access  private
router.get('/me', auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        if(!profile){
            return res.status(400).json({ msg: "'there is no profile for this user" });
        }
        res.json(profile);
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
})


// @route  GET api/profile/profile
// @desc   create or update user profile
// @access  private
router.post('/', [auth, [
    body('status', 'Status is required').not().isEmpty(), body('skills', 'Skills is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram , linkedin } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills) {
        //console.log(12);
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    //build social object
    profileFields.sociallinks = {};
    if(youtube) profileFields.sociallinks.youtube = youtube;
    if(twitter) profileFields.sociallinks.twitter = twitter;
    if(facebook) profileFields.sociallinks.facebook = facebook;
    if(linkedin) profileFields.sociallinks.linkedin = linkedin;
    if(instagram) profileFields.sociallinks.instagram = instagram;

    try{
        let profile = await Profile.findOne({ user: req.user.id });
        if(profile){
            // update
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields}, { new: true });
            return res.json(profile);

        }
        // create
        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile); 
    }  catch(err){
        console.error(err.message);
        res.status(500).send('server error');

    }    
})

// @route  GET api/profile/
// @desc   get all profiles
// @access  public
router.get('/', async (req, res) => {
    try{
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch(err){
        console.error(err.message);
        res.status(500).send('srever error');

    }
})


// @route  GET api/profile/user/:user_id
// @desc   get profile by user id
// @access  public
router.get('/user/:user_id', async (req, res) => {
    try{
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if(!profile) return res.status(400).json({ msg: 'profile not found'});
        res.json(profile);
    } catch(err){
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'profile not found'});
        }
        res.status(500).send('srever error');

    }
})


// @route  DELETE api/profile
// @desc   delete profile, user and posts
// @access  private
router.delete('/', auth, async (req, res) => {
    try{
        // remove user posts
        await Post.deleteMany({ user: req.user.id });

        // remove profile 
        await Profile.findOneAndRemove({ user: req.user.id });
        //remove user  
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'User removed' });
    } catch(err){
        console.error(err.message);
        res.status(500).send('server error');

    }
})

// @route  PUT api/profile/experience
// @desc   add profile experience
// @access  private
router.put('/experience', [ auth, [
    body('title', 'Title is required').not().isEmpty(),
    body('company', 'Company is required').not().isEmpty(),
    body('from', 'starting date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } = req.body;
    
    const newExp = {
        title, 
        company,
        location,
        from,
        to,
        current,
        description
    }

    try{
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp);
        
        await profile.save();
        res.json(profile);

    } catch(err){
        console.error(err.message);
        res.status(500).json('server error');
    }
})


// @route  DELETE api/profile/experience/:exp_id
// @desc   Delete experience from profile
// @access private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({ user: req.user.id });
        
        // get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    }  catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
})


// @route  PUT api/profile/education
// @desc   add profile education
// @access  private
router.put('/education', [ auth, [
    body('school', 'school is required').not().isEmpty(),
    body('degree', 'degree is required').not().isEmpty(),
    body('fieldofstudy', 'field of study is required').not().isEmpty(),
    body('from', 'starting date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, description } = req.body;
    
    const newEdu = {
        school, 
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try{
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift(newEdu);
        
        await profile.save();
        res.json(profile);

    } catch(err){
        console.error(err.message);
        res.status(500).json('server error');
    }
})


// @route  DELETE api/profile/education/:edu_id
// @desc   Delete education from profile
// @access private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({ user: req.user.id });
        
        // get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    }  catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
})


// @route  GET api/profile/github/:username
// @desc   Get user repos from Github
// @access Public
router.get('/github/:username', (req, res) => {
    try{
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        };
        request(options, (error, response, body) => {
            if(error)  console.error(error);

            if(response.statusCode !== 200){
                return res.status(404).json({ msg: 'No github profile found' });
            }
            res.json(JSON.parse(body));
        })
    }  catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
})


module.exports = router;
  