const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.routes = (app) =>{
	// Retrive token from twitch POST
	app.post('/auth', async (req, res) => {
		//check if req.body is empty
		if (!Object.keys(req.body).length) {
			res.status(400).json({
				message: 'Request body cannot be empty'
			});
		}
		const { code, scope } = (req.body);
		const token_res = JSON.stringify({
			client_id: process.env.TWITCH_CLIENTID,
			client_secret: process.env.TWITCH_SECRET,
			code: code,
			grant_type: 'authorization_code',
			redirect_uri: process.env.TWITCH_REDIRECT
		});
		// retrive token from twitch
		const response = await fetch('https://id.twitch.tv/oauth2/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: token_res
		})
		.then(json => json.json())
		.then(data => data);

		if(response.error){
			res.status(500).json({
				message: response.error
			});
		}

		const user_response = await fetch('https://api.twitch.tv/helix/users', {
			headers: {
				'Authorization': 'Bearer ' + response.access_token,
				'Client-Id': process.env.TWITCH_CLIENTID
			},
		})
		.then(json => json.json())
		.then(data => data);

		if(user_response.error){
			res.status(500).json({
				message: response.error
			});
		}

		const user_data = user_response.data[0];

		req.session.tk = response.access_token;
		req.session.tk_refresh = response.refresh_token;

		res.status(201).json({
			data: {
				sub: user_data.id,
				preferred_username: user_data.display_name,
				email: user_data.email,
				picture: user_data.profile_image_url,
				tk: response.access_token,
				tk_refresh: response.refresh_token
			}
		});
	});

	// Resfresh token from twitch POST
	app.post('/auth-refresh', async (req, res) => {
		//check if req.body is empty
		if (!Object.keys(req.body).length) {
			res.status(400).json({
				message: 'Request body cannot be empty'
			});
		}
		const { token, scope } = (req.body);
		const token_res = new URLSearchParams({
			client_id: process.env.TWITCH_CLIENTID,
			client_secret: process.env.TWITCH_SECRET,
			refresh_token: token,
			grant_type: 'refresh_token'
		});
		// retrive token from twitch
		const response = await fetch('https://id.twitch.tv/oauth2/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: token_res
		})
		.then(json => json.json())
		.then(data => data);

		console.log(response);

		if(response.error){
			res.status(response.status).json({
				message: response.error
			});
		} else {
			const user_response = await fetch('https://api.twitch.tv/helix/users', {
				headers: {
					'Authorization': 'Bearer ' + response.access_token,
					'Client-Id': process.env.TWITCH_CLIENTID
				},
			})
			.then(json => json.json())
			.then(data => data);

			if(user_response.error){
				res.status(500).json({
					message: response.error
				});
			} else {
				const user_data = user_response.data[0];

				req.session.tk = response.access_token;
				req.session.tk_refresh = response.refresh_token;

				res.status(201).json({
					data: {
						sub: user_data.id,
						preferred_username: user_data.display_name,
						email: user_data.email,
						picture: user_data.profile_image_url,
						tk: response.access_token,
						tk_refresh: response.refresh_token
					}
				});
			}
		}
	});

	// Retrive streams from twitch
	app.post('/streams', async (req, res) => {
		//check if req.body is empty
		if (!Object.keys(req.body).length) {
			res.status(400).json({
				message: 'Request body cannot be empty'
			});
		}
		const { token, id } = (req.body);
		// retrive streams from twitch
		const response_sugestions = await fetch('https://api.twitch.tv/helix/streams?first=100', {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + token,
				'Client-Id': process.env.TWITCH_CLIENTID
			}
		})
		.then(json => json.json())
		.then(data => data);

		if(response_sugestions.error){
			res.status(response_sugestions.status).json({
				status: response_sugestions.status,
				message: response_sugestions.message
			});
		} else {
			// retrive streams from twitch
			const response_streams = await fetch('https://api.twitch.tv/helix/streams/followed?user_id=' + id, {
				method: 'GET',
				headers: {
					'Authorization': 'Bearer ' + token,
					'Client-Id': process.env.TWITCH_CLIENTID
				}
			})
			.then(json => json.json())
			.then(data => data);

			if(response_streams.error){
				res.status(response_streams.status).json({
					status: response_streams.status,
					message: response_streams.message
				});
			}

			res.status(201).json({
				data: {
					streams: response_streams.data,
					sugestions: response_sugestions.data
				}
			});
		}
	});
};