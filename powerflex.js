var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');



var Nightmare = require('nightmare');       
var nightmare = Nightmare({ show: true });
var request = require('request');
var cheerio = require('cheerio');
var url = "http://powerflexusa.com/";

var app = express();
var PORT = process.env.PORT||8002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));


// LISTENER
app.listen(PORT, function(){
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

app.get('/powerflex/:partnum', function(req, res){
	request(url, function(error, response, html){
		var $ = cheerio.load(html,{
			normalizeWhitespace: true
		});
		if (error) throw error;
		nightmare
		.goto(url)
		.type('#ctl00_ctl03_search', req.params.partnum) // 
		.click('#ctl00_ctl03_go') // 
		.wait('.product-list-item-container')
		.evaluate(function () {
			var image = "http://powerflexusa.com" + $(".product-list-item").find("img").attr("src").replace("thumb","detail");    //attr("src").replace("thumb","detail");  
			return '<a href="' + image + '">' + image + '</a>';
		})
		.then(function (result) {
		res.send(result);
		console.log(result);
		})
		.catch(function (error) {
		console.error('Search failed:', error);
		var defaultResponse = "<h2>NA</h2>";
		res.send(defaultResponse);
		});
	});
});
