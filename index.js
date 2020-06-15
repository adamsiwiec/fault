const axios = require('axios');
const fs = require('fs');
const { promisify } = require('util')
const path = require('path');
const mkdir = promisify(fs.mkdir);
const wfile = promisify(fs.writeFile);
const mongoose = require('mongoose');
const _ = require('lodash');
mongoose.connect('mongodb://localhost:27017/faults', {useNewUrlParser: true, useUnifiedTopology: true});

let Fault = mongoose.model('Fault', {location: String });


// Require the framework and instantiate it
const fastify = require('fastify')({
  logger: true
})


fastify.register(require('fastify-static'), {
	  root: path.join(__dirname, 'frontend/dist'),
	  prefix: '/fault/static'
})


fastify.post('/fault/new', async (req, res) => {

	const fault = new Fault();
	let loc = "/mnt/shared/" + fault._id
	await mkdir(loc)
	await wfile(loc + "/fault.log", req.body.text)
	await wfile(loc + "/sys.info", req.body.info)
	fault.location = loc
	fault.save();
	return {
		url: "pi.siwiec.us/fault/" + fault._id
	}

});

fastify.get('/fault/:id', async (req, res) => {

	res.sendFile('index.html');
})



// Declare a route
fastify.get('/fault/container/:id', async function (req, res) {
  
	if (!fs.existsSync('/mnt/shared/' + req.params.id)) return { err: 'doesn\'t exist' }
	let dockerContainers = await axios.get('http://0.0.0.0:2375/containers/json')
	let portsUsed = dockerContainers.data.map(obj => obj.Ports[0].PublicPort);
	
	let allPorts = _.range(3000, 4000);
	portsUsed.forEach(x => {
		let index = allPorts.indexOf(x);
		if(index > -1) {
			allPorts.splice(index, 1)
		}
	})

	console.log(allPorts);

	let port = allPorts[0].toString();
	

	let data = await axios.post('http://0.0.0.0:2375/containers/create', {
             Image: 'term',
             ExposedPorts: {
                 '7681': {},
             },
             Mounts: [
                 {
                     Target: '/data',
                     Source: "/mnt/shared/" + req.params.id,
                     Type: 'bind',
                 },
             ],
             PortBindings: {
                 '7681': [
                     {
			 HostPort: port,
                     },
                 ],
             },
		AutoRemove: true
         })

		

	let started = await axios.post('http://0.0.0.0:2375/containers/' + await data.data.Id + '/start');
	return {
	wsurl: "ws://pi.siwiec.us/" + port + "/ws",
	tokenurl: "http://pi.siwiec.us/" + port + "/token"
	}
});

// Run the server!
fastify.listen(1337, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})
