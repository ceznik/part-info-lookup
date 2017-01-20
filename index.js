var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');



var Nightmare = require('nightmare');       
var nightmare = Nightmare({ show: true });
var request = require('request');
var url = "http://www.fordparts.com/Commerce/InterchangeableGuide.aspx";
var cheerio = require('cheerio');

var app = express();
var PORT = process.env.PORT||8001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));


// LISTENER
app.listen(PORT, function(){
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

app.get('/motorcraft/:partnum', function(req, res){
	request(url, function(error, response, html){
		var $ = cheerio.load(html,{
			normalizeWhitespace: true
		});
		if (error) throw error;
		nightmare
		.goto(url)
		.click(".InterchangeTab > a")
		.type('#txtInterchangePartNo', req.params.partnum) // 
		.click('#btnSearchByInterchange') // 
		.wait('.rptrInterchageParts_item')
		.click('#ctl00_MainContent_rptrInterchangeResult_ctl01_rptrInterchageParts_ctl00_lbtnFordPartNumber')
		.wait('.PartDetailsPanel')
		.evaluate(function () {
			var productInfo = '<!DOCTYPE html>' +
							  '<html>' + 
							  '<head>' +
							  '</head>'+
							  '<body>' +
							  '<table>'+
								'<tr>'+
								'<th> Part Number </th>' +
								'<th> Weight </th>' +
								'<th> Dimensions </th>' +
								'<th> PicURLs </th>' +
								'</tr>' +
								'<tr>';

			var Part = $("p:contains('Part Number')").text().replace("Part Number: ", "");
			var Weight = $("#divWeight").text().replace("Weight: ", "");
			var Dimensions = $("#divDimensions").text().replace("Dimensions: ", "");
			var images = [];
			$(".Thumbnails").find("img").each(function(i, elem){
				images[i] = "http://www.fordparts.com" + ($(this).attr("src").replace("&dw=42&dh=42","&dw=0&dh=0"));
			});
			productInfo += '<td>' + Part + '</td>' +
						   '<td>' + Weight +'</td>' + 
						   '<td>' + Dimensions + '</td>' + 
						   '<td>' + images.join("|") + '</td>' +
						   '</td>' +
						   '</table>' + 
						   '</body>' +
						   '</html>';


			return productInfo;
		})
		.end()
		.then(function (result) {
		res.send(result);
		})
		.catch(function (error) {
		console.error('Search failed:', error);
		});
		console.log("Route steps completed");
	});
});


