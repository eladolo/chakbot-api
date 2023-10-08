const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require("../serviceAccount.json");

initializeApp({
	credential: cert(serviceAccount)
});

const db = getFirestore();
const processSubscription = async (res, data) => {
	const subscriptions = db.collection('subscriptions').doc(data.subscriber.email_address);
	const doc = await subscriptions.get();
	
	if(doc.exists) {
		await subscriptions.update({
			id: data.id,
			mail: data.subscriber.email_address,
			type: parseInt(data.billing_info.outstanding_balance.value, 10),
			auto_renewal: data.auto_renewal,
			status: data.status,
			update_time: data.status.status_update_time
		})
		return res.status(201).json({'status': 201, data: "success"})
	} else {
		await subscriptions.set({
			id: data.id,
			mail: data.subscriber.email_address,
			type: parseInt(data.billing_info.outstanding_balance.value, 10),
			auto_renewal: data.auto_renewal,
			status: data.status,
			update_time: data.status.status_update_time
		})
		return res.status(202).json({'status': 202, data: "new"})
	}
};
const cancelSubscription = async (res, data) => {
	const subscriptions = db.collection('subscriptions').doc(data.subscriber.email_address);
	
	await subscriptions.update({
		id: data.id,
		mail: data.subscriber.email_address,
		type: parseInt(data.billing_info.outstanding_balance.value, 10),
		auto_renewal: data.auto_renewal,
		status: data.status,
		update_time: data.status.status_update_time
	});

	const config = db.collection('botconfig').doc(uid);
	const docC = await config.get();

	delete docC.subscription

	await config.setDoc(docC)

	return res.status(208).json({'status': 208, data: "success"});
};

exports.routes = (app) =>{
	app.post('/subscriptions/check', async (req, res) => {
		const { uid, mail } = req.body;
		if(!uid || !mail) {
			return res.status(407).json({'status': 407, error: 'Empty values'})
		}
		const subscriptions = db.collection('subscriptions').doc(mail);
		const doc = await subscriptions.get();
		
		if(doc.exists) {
			const docData = doc.data();

			if(!docData.uid) {
				await subscriptions.update({
					uid: uid
				});
			} 
			else if(docData.uid === uid) {
				const config = db.collection('botconfig').doc(uid);
				await config.update({
					subscription: docData
				});
				
				res.status(201).json({'status': 201, data: docData});
			} else {
				res.status(409).json({'status': 409, message: "Subscription already set for other user"});
			}
		} else {
			res.status(400).json({'status': 400, message: "not found"});
		}
	});

	app.post('/subscriptions/webhook', async (req, res) => {
		const data = req.body.resource;
		const type = req.body.event_type
		
		switch(type) {
			case 'BILLING.SUBSCRIPTION.ACTIVATED':
			case 'BILLING.SUBSCRIPTION.UPDATED':
				return processSubscription(res, data)
			case 'BILLING.SUBSCRIPTION.EXPIRED':
			case 'BILLING.SUBSCRIPTION.CANCELLED':
			case 'BILLING.SUBSCRIPTION.SUSPENDED':
				return cancelSubscription(res, data)
			default:
				res.status(440).json({'status': 440, data: "event not set"})
		}
	});
};