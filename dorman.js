var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var fs = require('fs');
var csv = require('csv-stringify');
var Nightmare = require('nightmare');       
var nightmare = Nightmare({ show: true, timout: 2000 });
var request = require('request');
//var url2 = "https://skyjacker.com/s?=";
var cheerio = require('cheerio');

var app = express();
var PORT = process.env.PORT||8050;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));


// LISTENER
app.listen(PORT, function(){
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

app.get('/dorman/:partnum', function(req, res){
	var url = "http://www.dormanproducts.com/gsearch.aspx?type=keyword&origin=keyword&q=" + req.params.partnum;
	request(url, function(error, response, html){
		var $ = cheerio.load(html,{
			normalizeWhitespace: true
		});
		if (error) throw error;
		nightmare
		.goto(url)
		.wait('#searchFound')
		.click('.searchItems-btn > a')
		.wait('#productDetails')
		.evaluate( function() {
			var images = [];
			if($(".productImgThumb img").length > 0) {
				$(".productImgThumb").find("img").each(function(i, elem){
					images[i] = $(this).attr("src").replace("icon","medium");
				});
			}

			else {
				images[0] = $(".productImgMain img").attr("src")
			}
			return images.join("|");
		})
		.then(function(result){
			res.send(result);
			console.log("Result: ", result);
			console.log("Results sent to browser");
		})
		.catch(function(error){
			console.log('Search failed: ', error);
			res.send("ERROR");
		});
	});
});