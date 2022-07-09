// .env usage
require('dotenv').config();
// Require express
const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
// Initialize express
const app = express();
// create a server
const PORT = process.env.PORT || 4555;
// API routes
const router = require('./router');

// session management
app.use(sessions({
	secret: "3OX2JssjC18NzlrJds3Ql6ZJXPzEJfpe29ITb",
	saveUninitialized: true,
	cookie: { maxAge: 1000 * 60 * 60 * 24 },
	resave: false
}));
// parse json objects
app.use(express.json());
// parse url encoded objects- data sent through the url
app.use(express.urlencoded({ extended: true }));
// cookie parser middleware
app.use(cookieParser());
// headers middleware
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});
// start server listen
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
// add modules routes
router.twitch.routes(app);
// default response
app.post('/*', async (req, res) => {
    res.status(201).json({
    	code: 404,
        data: "Hello api 🌼"
    });
});
app.put('/*', async (req, res) => {
    res.status(201).json({
    	code: 404,
        data: "Hello api 🌼"
    });
});
app.get('/*', async (req, res) => {
    res.status(201).json({
    	code: 404,
        data: "Hello api 🌷"
    });
});
app.patch('/*', async (req, res) => {
    res.status(201).json({
    	code: 404,
        data: "Hello api 🌹"
    });
});
app.delete('/*', async (req, res) => {
    res.status(201).json({
    	code: 404,
        data: "Hello api 🌺"
    });
});