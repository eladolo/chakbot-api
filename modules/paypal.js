const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.routes = (app) =>{
	// Retrive token from pp POST
    const EP = process.env.PP_EP;
    const getToken = async () => {
        const token_res = JSON.stringify({
			client_id: process.env.TWITCH_CLIENTID,
			client_secret: process.env.TWITCH_SECRET,
		});
		// retrive token from twitch
		const response = await fetch(`https://${EP}/v1/oauth2/token`, {
            method: "POST",
            headers: {
                Authorization: "Basic " + Buffer.from(`${process.env.PP_CLIENTID}:${process.env.PP_SECRET}`, "base64"),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: "client_credentials",
            })
		})
		.then(json => json.json())
		.then(data => data);

        return response.access_token;
    };

	app.post('/subscriptions/check', async (req, res) => {
		//check if req.body is empty
		if (!Object.keys(req.body).length) {
			res.status(400).json({
				message: 'Request body cannot be empty'
			});
		}
		const token = await getToken();
		// retrive token from twitc
		h
		const response = await fetch(`https://${EP}/v1/oauth2/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: token
		})
		.then(json => json.json())
		.then(data => data);

		if(response.status >= 400){
			res.status(response.status).json({
				message: response.message
			});
		} else {
		}
	});

	app.post('/subscriptions/webhook', async (req, res) => {
		res.status(201).json(req.body)
	});
};