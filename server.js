const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const connectDB = require('./config/db');
const path = require('path');

connectDB();

// init middleware
app.use(express.json({ extended: false }));

// define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts')); 
app.use('/api/profile', require('./routes/api/profile'));

// serve static assets in production
if(process.env.NODE_ENV === 'production'){
    // set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    })
}



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); 
})