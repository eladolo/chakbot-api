const getToken = async (code, data) =>{
    try{
        const response = await fetch();
        if(!response) {
            throw new Error('Failed to get token');
        }

        return {
            error: null,
            data: response
        };
     } catch (error) {
        return {
            error: error.message,
            data: null
        };
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
        const { title, author, publisher, read } = (req.body);
        // retrive token from twitch
        const response = await fetch();
        if (response.error) {
            res.status(500).json({
                message: response.error
            });
        }
        res.status(201).json({
            data: response.data
        });
    });
    app.get('/auth', async (req, res) => {
        res.status(201).json({
            data: "Twitch 💫"
        });
    });
};