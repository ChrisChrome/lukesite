const express = require('express');
const cors = require('cors');
const { verify } = require('hcaptcha');
const app = express();
const path = require('path');
const fs = require('fs');
const config = require("./config.json")
const Discord = require("discord.js");
const hook = new Discord.WebhookClient({ url: config.contact_webhook })
const hCaptchaSecret = config.captcha_secret;

// Set up express for static files
app.use(express.static('static'));

// Set up express for body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/contact", (req, res) => {
	const token = req.body["h-captcha-response"];
	verify(hCaptchaSecret, token).then((capData) => {
		if (capData.success === false) return res.redirect("/contact/?success=false&error=captcha");
		const { name, email, message } = req.body;
		hook.send({
			"content": "@everyone",
			"embeds": [
				{
					"title": "New message!",
					"color": 0x00ff00,
					"fields": [
						{
							"name": "Name",
							"value": name
						},
						{
							"name": "Email",
							"value": email
						},
						{
							"name": "Message",
							"value": message
						},
						{
							"name": "IP Address",
							"value": req.headers['x-forwarded-for'] || req.connection.remoteAddress
						}
					]
				}
			]
		});
		res.redirect("/contact/?success=true");
	})
});

// Start the express server
app.listen(config.port, () => {
	console.log(`Server is running on port ${config.port}`);
});