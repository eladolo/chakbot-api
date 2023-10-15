const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const EP = process.env.PP_EP;

const getToken = async () => {
	// retrive token from paypal
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

	return response;
};

exports.routes = (app) =>{
	// Setup cors
	if (process.env.NODE_ENV === "production") {
		app.use(cors({
			origin: ["https://bot.chakstudio.com", "https://chakbot-v2.vercel.app"]
		}));
	}
	app.post('/paypal/check', async (req, res) => {
		const token = await getToken();
		res.status(201).json({'status': 201, data: token});
	});
};