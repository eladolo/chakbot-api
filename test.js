const { spawn } = require('child_process');
const got = (...args) => import('got').then((module) => module.default(...args));
const test = require('tape');

// Start the app
const env = Object.assign({}, process.env, {PORT: 4556});
const child = spawn('node', ['server.js'], {env});

let stop = false;

test('responds requests', (t) => {
	// Wait until the server is ready
	t.plan(15);
	child.stdout.on('data', async () => {
		// Make a request to our app
		if(!stop) {
			stop = true;
			await (async () => {
				let response = {};
				try {
					response = await got('http://127.0.0.1:4556', {method: 'GET'});
					let body = JSON.parse(response.body);
					// Assert content checks
					t.equal(body.code, 404, "should return 404 GET");
					t.equal(body.hasOwnProperty('data'), true, "should have data GET");
					t.equal(body.data, "Hello api 🌷", "should have the flower 🌷");

					response = await got('http://127.0.0.1:4556', {method: 'POST'});
					body = JSON.parse(response.body);
					// Assert content checks
					t.equal(body.code, 404, "should return 404 POST");
					t.equal(body.hasOwnProperty('data'), true, "should have data POST");
					t.equal(body.data, "Hello api 🌼", "should have the flower 🌼");

					response = await got('http://127.0.0.1:4556', {method: 'PUT'});
					body = JSON.parse(response.body);
					// Assert content checks
					t.equal(body.code, 404, "should return 404 PUT");
					t.equal(body.hasOwnProperty('data'), true, "should have data PUT");
					t.equal(body.data, "Hello api 🌼", "should have the flower 🌼");

					response = await got('http://127.0.0.1:4556', {method: 'PATCH'});
					body = JSON.parse(response.body);
					// Assert content checks
					t.equal(body.code, 404, "should return 404 PATCH");
					t.equal(body.hasOwnProperty('data'), true, "should have data PATCH");
					t.equal(body.data, "Hello api 🌹", "should have the flower 🌹");

					response = await got('http://127.0.0.1:4556', {method: 'DELETE'});
					body = JSON.parse(response.body);
					// stop the server
					child.kill();
					// Assert content checks
					t.equal(body.code, 404, "should return 404 DELETE");
					t.equal(body.hasOwnProperty('data'), true, "should have data DELETE");
					t.equal(body.data, "Hello api 🌺", "should have the flower 🌺");
				} catch (ex) {}
			})();
		} 
	});
});
