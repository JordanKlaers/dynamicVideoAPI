const child_process = require('child_process');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
	cors: {
		origin: '*',
		methods: ['GET']
	}
});
const port = 3001;
const puppeteer = require('puppeteer');

io.on('connection', async (socket) => {
	console.log('Client connected.');

	socket.on('streamVideo', data => {
		socket.emit('videoStreamToClient', data);
	})
	// Disconnect listener
	socket.on('disconnect', function () {
		console.log('Client disconnected.');
	});
});



app.get('/', async (req, res, next) => {

	try {
		res.set({
			'Access-Control-Allow-Origin': ['*']
		});
		next();
	} catch (err) {
		console.log('ERROR: ', err);
	}
});


let clients = [];
app.get('/stream', async (req, res) => {
	try {
		res.set({
			'Cache-Control': 'no-cache',
			'Content-Type': 'text/event-stream',
			'Connection': 'keep-alive',
			'Access-Control-Allow-Origin': ['*']
		});
		res.flushHeaders();

		let count = 0;
		setInterval(async () => {
			res.write('event: message\n');
			res.write(`data: ${count}`);
			res.write('\n\n');
			count++;
		}, 1000);
		const clientId = Date.now();
		const newClient = {
			id: clientId,
			res
		};
		clients.push(newClient);
		// When client closes connection we update the clients list
		// avoiding the disconnected one
		req.on('close', () => {
			clients = clients.filter(c => c.id !== clientId);
			console.log(`${clientId} Connection closed. ${clients.length} remaining clients`);
		});
	} catch (err) {
		console.log('err:', err);
	}
});

app.get('/test', async (req, res) => {
	// res.setHeader('Access-Control-Allow-Origin', ['*', 'http://localhost:9001']);
	// res.set({
	// 	'Access-Control-Allow-Origin': ['*', 'http://localhost:9001']
	// });
	try {
		io.on('connection', async (socket) => {
			console.log('Client connected.');

			socket.on('test', async (data) => {
				console.log('recieved: ', data);
				console.log('do I have access to the RES', res);
				/*
					Incoming "data" is the 
				*/
			});
		});
		const browser = await puppeteer.launch({ headless: false, args: ['--autoplay-policy=no-user-gesture-required'] });
		const page = await browser.newPage();
		await page.goto('http://localhost:9001/');
		await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: 'C:\\Projects\\vueWebpackPlayground\\frames' });
		await page.evaluate(() => {
			debugger;
		});
	} catch (err) {
		console.log('err:', err);
	}
});


http.listen(port, () => console.log(`Hello world app listening on port ${port}!`))
