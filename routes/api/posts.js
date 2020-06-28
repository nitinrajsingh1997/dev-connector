const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { json } = require('express');


// @route  POST api/posts
// @desc   Create a post
// @access  private
router.post('/', [ auth, [
    body('text', 'text is required').not().isEmpty()
] ],  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const user = await User.findById(req.user.id).select('-password');
        const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
        });

        const post = await newPost.save();
        res.json(post);
    }  catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
})


// @route  GET api/posts
// @desc   Get all post
// @access  private
router.get('/', auth, async (req, res) => {
    try{
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    }  catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
})


// @route  GET api/posts/:id
// @desc   Get post by id
// @access  private
router.get('/:id', auth, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({ msg: 'post not found' });
        } 


        res.json(post);
    }  catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'post not found' });
        }
        res.status(500).send('server error');
    }
})

// @route  DELETE api/posts/:id
// @desc   Delete a post
// @access  private
router.delete('/:id', auth, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({ msg: 'post not found' });
        }

        // check on user

        if(post.user.toString() !== req.user.id){
            return res.status(401).json({ msg: 'user not authorised' });
        }

        await post.remove();
        res.json({ msg: 'Post removed' });
    } catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'post not found' });
        }
        res.status(500).send('server error');
    }
})

// @route  PUT api/posts/like/:id
// @desc   Like a post
// @access  private
router.put('/like/:id', auth, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);

        // check if the post is alrreday been liked by the user
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0 ){
            return res.status(400).json({ msg: 'post alreday liked' });
        }

        post.likes.unshift({ user: req.user.id });

        await post.save();

        res.json(post.likes);
    } catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
})



// @route  PUT api/posts/unlike/:id
// @desc   Like a post
// @access  private
router.put('/unlike/:id', auth, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);

        // check if the post is alrreday been liked by the user
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0 ){
            return res.status(400).json({ msg: 'post has not yet been liked' });
        }

        //get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();

        res.json(post.likes);
    } catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
})


// @route  POST api/posts/comment/:id
// @desc   Comment on a post 
// @access  private
router.post('/comment/:id', [ auth, [
    body('text', 'text is required').not().isEmpty()
] ],  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
        };

        await post.save();
        res.json(post.comments);
    }  catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
})


// @route  DELETE api/posts/comment/:id/:comment_id
// @desc   delete a comment 
// @access  private
router.delete('/', auth, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);

        // pull out comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        // make sure comments exists
        if(!comment){
            return res.status(404).json({ msg: 'comment does not exist' });
        }

        // check user 
        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({ msg: 'User not authorized' });
        }

        //get remove index
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removeIndex, 1);
        
        await post.save();
        
        res.json(post.comments);


    } catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
})


module.exports = router;
