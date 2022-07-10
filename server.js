// .env usage
require('dotenv').config();
// Require express
const express = require('express');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
// Initialize express
const app = express();
// create a server
const PORT = process.env.PORT || 4555;
// API routes
const router = require('./router');

// session management
app.use(session({
    cookieName: 'chakstudio-api-session',
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false,
    genid: function(req) {
      	console.log('session id created');
    	return uuidv4();
	}
}));
app.use(function(req, res, next) {
    if (!req.session.views) {
        req.session.views = {};
    }
    // get the url pathname
    let pathname = req.url.split("/");
    pathname = pathname[pathname.length - 1];
    console.log("url: " + pathname);
    // count the views
    req.session.views[pathname == "" ? "home" : pathname] = (req.session.views[pathname] || 0) + 1;
    next();
})
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