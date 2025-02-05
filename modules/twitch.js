const SevenTV = require('7tv').default;
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const getAppToken = async() => {
	// retrive token from twitch
	const token_res = JSON.stringify({
		client_id: process.env.TWITCH_CLIENTID,
		client_secret: process.env.TWITCH_SECRET,
		grant_type: 'client_credentials'
	});
	const response_token = await fetch('https://id.twitch.tv/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: token_res
	})
	.then(json => json.json())
	.then(data => data);

	if(response_token.status >= 400) {
		return { 'error': true };
	} else {
		return response_token;
	}
};

exports.routes = (app) =>{
	// Retrive token from twitch POST
	app.post('/auth', async (req, res) => {
		//check if req.body is empty
		if (!Object.keys(req.body).length) {
			res.status(400).json({
				message: 'Request body cannot be empty'
			});
		}
		const { code } = (req.body);
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

		if(response.status >= 400){
			res.status(response.status).json({
				message: response.message
			});
		} else {
			let user_response = await fetch('https://api.twitch.tv/helix/users', {
				headers: {
					'Authorization': 'Bearer ' + response.access_token,
					'Client-Id': process.env.TWITCH_CLIENTID
				},
			})
			.then(json => json.json())
			.then(data => data);

			if(user_response.status >= 400){
				res.status(user_response.status).json({
					message: user_response.message
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

		if(response.status >= 400){
			res.status(response.status).json({
				message: response.message
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

			if(user_response.status >= 400){
				res.status(user_response.status).json({
					message: user_response.message
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

		if(response_sugestions.status >= 400){
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

			if(response_streams.status >= 400){
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

	// Retrive badges from twitch
	app.post('/badges', async (req, res) => {
		//check if req.body is empty
		if (!Object.keys(req.body).length) {
			res.status(400).json({
				message: 'Request body cannot be empty'
			});
		}
		const { token, channel } = (req.body);
		// retrive gloabl badges from twitch
		const response_global = await fetch('https://api.twitch.tv/helix/chat/badges/global', {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + token,
				'Client-Id': process.env.TWITCH_CLIENTID
			}
		})
		.then(json => json.json())
		.then(data => data);

		if(response_global.status >= 400){
			res.status(response_global.status).json({
				status: response_global.status,
				message: response_global.message
			});
		} else {
			// retrive channel badges from twitch
			const response_badges = await fetch('https://api.twitch.tv/helix/chat/badges?broadcaster_id=' + channel, {
				method: 'GET',
				headers: {
					'Authorization': 'Bearer ' + token,
					'Client-Id': process.env.TWITCH_CLIENTID
				}
			})
			.then(json => json.json())
			.then(data => data);

			if(response_badges.status >= 400){
				res.status(response_badges.status).json({
					status: response_badges.status,
					message: response_badges.message
				});
			} else {
				res.status(201).json({
					data: {
						global: response_global.data,
						badges: response_badges.data
					}
				});
			}
		}
	});

	// Retrive emotes from twitch, BTTV and FFZ
	app.post('/emotes', async (req, res) => {
		//check if req.body is empty
		if (!Object.keys(req.body).length) {
			res.status(400).json({
				message: 'Request body cannot be empty'
			});
		}
		const { token, channel, name, sets } = (req.body);
		// retrive global emotes from twitch
		const response_global = await fetch('https://api.twitch.tv/helix/chat/emotes/global', {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + token,
				'Client-Id': process.env.TWITCH_CLIENTID
			}
		})
		.then(json => json.json())
		.then(data => data);

		if(response_global.status >= 400){
			res.status(response_global.status).json({
				status: response_global.status,
				message: response_global.message
			}).send();
			return;
		}
		// retrive channel emotes from twitch
		const response_emotes = await fetch('https://api.twitch.tv/helix/chat/emotes?broadcaster_id=' + channel, {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + token,
				'Client-Id': process.env.TWITCH_CLIENTID
			}
		})
		.then(json => json.json())
		.then(data => data);

		if(response_emotes.status >= 400){
			res.status(response_emotes.status).json({
				status: response_emotes.status,
				message: response_emotes.message
			}).send();
			return;
		}

		const response_user_emotes = [];
		if(sets != ''){
			// retrive user emotes from twitch
			let user_emotes = {};
			let tmp_sets = sets.split(",").filter(set => set != 0);
			if(tmp_sets.length <= 25){
				tmp_sets = tmp_sets.join("&emote_set_id=");
				let url = 'https://api.twitch.tv/helix/chat/emotes/set?emote_set_id=' + tmp_sets;
				// console.log(url);
				user_emotes = await fetch(url, {
					method: 'GET',
					headers: {
						'Authorization': 'Bearer ' + token,
						'Client-Id': process.env.TWITCH_CLIENTID
					}
				})
				.then(json => json.json())
				.then(data => data);

				if(user_emotes.status >= 400){
					res.status(user_emotes.status).json({
						status: user_emotes.status,
						message: user_emotes.message
					}).send();
					return;
				}

				user_emotes.data.map(res_em => {
					response_user_emotes.push(res_em);
				});
			} else {
				const pages = Math.floor(tmp_sets.length / 25);

				for(let pix = 0; pix < pages; pix++){
					let tmp_mul_sets = tmp_sets.slice(pix * 24, (pix + 1) * 24).join("&emote_set_id=");
					let url = 'https://api.twitch.tv/helix/chat/emotes/set?emote_set_id=' + tmp_mul_sets;
					let tmp_res = await fetch(url, {
						method: 'GET',
						headers: {
							'Authorization': 'Bearer ' + token,
							'Client-Id': process.env.TWITCH_CLIENTID
						}
					})
					.then(json => json.json())
					.then(data => data);

					tmp_res.data.map(res_em => {
						response_user_emotes.push(res_em);
					});
				}
			}
		}

		// retrive channel emotes from betterttv
		const response_global_bttv = await fetch('https://api.betterttv.net/3/cached/emotes/global', {
			method: 'GET'
		})
		.then(json => json.json())
		.then(data => data);

		if(response_global_bttv.status >= 400){
			res.status(response_global_bttv.status).json({
				status: response_global_bttv.status,
				message: response_global_bttv.message
			}).send();
		}
		let response_bttv = await fetch('https://api.betterttv.net/3/cached/users/twitch/' + channel, {
			method: 'GET'
		})
		.then(json => json.json())
		.then(data => data);

		if(response_bttv.status >= 400 || response_bttv.message == 'user not found'){
			// res.status(response_bttv.status).json({
			// 	status: response_bttv.status,
			// 	message: response_bttv.message
			// }).send();
			// return;
			response_bttv = {
				channelEmotes: [],
				sharedEmotes: []
			};
		}

		// console.log(response_bttv);

		const bttv_res = [...response_bttv.channelEmotes, ...response_bttv.sharedEmotes, ...response_global_bttv].map(emote => {
			return {
				name: emote.code,
				url: `https://cdn.betterttv.net/emote/${emote.id}/1x`
			};
		});

		// retrive channel emotes from frankerfacez
		const response_frankerfacez = await fetch('https://api.frankerfacez.com/v1/emoticons?_sceheme=https', {
			method: 'GET'
		})
		.then(json => json.json())
		.then(data => data);

		if(response_frankerfacez.status >= 400){
			res.status(response_frankerfacez.status).json({
				status: response_frankerfacez.status,
				message: response_frankerfacez.message
			}).send();
		}
		let response_frankerfacez_channel = await fetch('https://api.frankerfacez.com/v1/room/' + name, {
			method: 'GET'
		})
		.then(json => json.json())
		.then(data => data);

		if(response_frankerfacez_channel.status >= 400){
			// res.status(response_frankerfacez_channel.status).json({
			// 	status: response_frankerfacez_channel.status,
			// 	message: response_frankerfacez_channel.message
			// }).send();
			// return;
			response_frankerfacez_channel = [];
		}

		if(response_frankerfacez_channel.sets){
			response_frankerfacez_channel = response_frankerfacez_channel.sets[response_frankerfacez_channel.room.set].emoticons;
		}

		const ffz_res = [...response_frankerfacez.emoticons, ...response_frankerfacez_channel].map(emote => {
			return {
				name: emote.name,
				url: emote.urls[1]
			};
		});

		// retrive 7tv channel emotes
		const sevenTV_emotes = [];
		const sevenTV_response = await SevenTV.getEmotes(Number(channel))
		.then(data => {
			return {
				status: 201,
				data: data
			}
		})
		.catch(error => {
			return {
				error: error,
				status:503
			}
		});

		if(sevenTV_response.status == 201){
			sevenTV_response.data.forEach(emote => {
				sevenTV_emotes.push({
					name: emote.name,
					url: `https://cdn.7tv.app/emote/${emote.id}/2x.webp`
				});
			});
		}

		// send final response with 201 status
		res.status(201).json({
			data: {
				global: response_global.data,
				emotes: response_emotes.data,
				uemotes: response_user_emotes,
				bttv: bttv_res,
				ffz: ffz_res,
				sevenTV: sevenTV_emotes
			}
		}).send();
	});

	// EventSubs helpers
	app.post('/eventsub/subscribe', async (req, res) => {
		//check if req.body is empty
		if (!Object.keys(req.body).length) {
			res.status(400).json({
				message: 'Request body cannot be empty'
			});
		}
		const { token, user_id, sessid } = (req.body);
		const topics = [{
			name:'channel.raid',
			version: '1',
			condition: {
				'from_broadcaster_user_id': user_id
			},
			transport: {
				'method': 'websocket',
				'session_id': sessid
			},
		}, {
			name:'channel.raid',
			version: '1',
			condition: {
				'to_broadcaster_user_id': user_id
			},
			transport: {
				'method': 'websocket',
				'session_id': sessid
			},
		}, {
			name:'channel.update',
			version: '1',
			condition: {
				'broadcaster_user_id': user_id
			},
			transport: {
				'method': 'websocket',
				'session_id': sessid
			},
		}, {
			name:'user.update',
			version: '1',
			condition: {
				'user_id': user_id
			},
			transport: {
				'method': 'websocket',
				'session_id': sessid
			},
		}, {
			name:'stream.online',
			version: '1',
			condition: {
				'broadcaster_user_id': user_id
			},
			transport: {
				'method': 'websocket',
				'session_id': sessid
			},
		}, {
			name:'stream.offline',
			version: '1',
			condition: {
				'broadcaster_user_id': user_id
			},
			transport: {
				'method': 'websocket',
				'session_id': sessid
			},
		}];
		
		for await (let topic of topics) {
			const response_global = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer ' + token,
					'Client-Id': process.env.TWITCH_CLIENTID,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					'type': topic.name,
					'version': topic.version,
					'condition': topic.condition,
					'transport': topic.transport
				})
			})
			.then(json => json.json())
			.then(data => data);
	
			if(response_global.status >= 400){
				console.log(response_global);
				res.status(response_global.status).json({
					topic: topic,
					status: response_global.status,
					message: response_global.message
				}).send();
				return;
			}
		}
		res.status(200).json({
			status: 'ok'
		}).send();
		return;
	});

	app.post('/eventsub/unsubscribe', async (req, res) => {
		//check if req.body is empty
		if (!Object.keys(req.body).length) {
			res.status(400).json({
				message: 'Request body cannot be empty'
			});
		}
		const { token, eventid } = (req.body);
		
		const response_global = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions?id=' + eventid, {
			method: 'DELETE',
			headers: {
				'Authorization': 'Bearer ' + token,
				'Client-Id': process.env.TWITCH_CLIENTID
			}
		})
		.then(data => data);

		if(response_global.status >= 400){
			console.log(response_global);
			res.status(response_global.status).json({
				error: true,
				message: response_global
			}).send();
			return;
		}

		res.status(200).json({
			status: 'ok'
		}).send();
		return;
	});

	app.post('/eventsub', async (req, res) => {
		//check if req.body is empty
		if (!Object.keys(req.body).length) {
			res.status(400).json({
				message: 'Request body cannot be empty'
			});
		}
		const { user_id, token } = (req.body);
		
		let url = 'https://api.twitch.tv/helix/eventsub/subscriptions'
		if (user_id) {
			url += `?user_id=${user_id}`
		}
		const response_global = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + token,
				'Client-Id': process.env.TWITCH_CLIENTID,
				'Content-Type': 'application/json'
			}
		})
		.then(json => json.json())
		.then(data => data);

		if(response_global.status >= 400){
			console.log(response_global);
			res.status(response_global.status).json({
				status: response_global.status,
				message: response_global.message
			}).send();
			return;
		} else {
			res.status(200).json({
				events: response_global
			}).send();
			return;
		}

	});
};