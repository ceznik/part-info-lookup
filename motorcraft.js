var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var fs = require('fs');
var csv = require('csv-stringify');
var Nightmare = require('nightmare');       
var nightmare = Nightmare({ show: true, timout: 2000 });
var request = require('request');
var url = "http://www.fordparts.com/Commerce/InterchangeableGuide.aspx";
//var url2 = "https://skyjacker.com/s?=";
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


app.get('/motorcraft/buyersguide/:partnum', function(req, res){
	
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
		.click('#buyersGuideButton')
		.wait('#BuyersGuide')
		.evaluate(function () {
			//var productInfo = [["Part Number","Years","Make","Model","Engine","Qty Per Vehicle"]];
			var productInfo = [];
			var partnum = $(".label:contains('Part Number:')").siblings().text().trim();
			$('.header').siblings().each(function(i, elem){
				productInfo.push([partnum].concat($(this).children().map(function(i, el){
					return $(this).text();
				}).get()));
			});
			return productInfo;
		})
		.then(function (result) {
			res.send("fitment data saved");
			csv(result, function(err, output){
				fs.appendFile('motorcraft.txt', output, (err) => {
					if (err) throw err;
					console.log("data appended to file");
				});
			});
		})
		.catch(function (error) {
			console.error('Search failed:', error);
			var defaultResponse = '<!DOCTYPE html>' +
								  '<html>' + 
								  '<head>' +
								  '</head>'+
								  '<body>' +
								  '<table>'+
									'<tr>'+
									'<th> Years </th>' +
									'<th> Make </th>' +
									'<th> Model </th>' +
									'<th> Engine </th>' +
									'<th> Qty </th>' +
									'</tr>' +
									'<tr>' +
									'<td>' + "N/A" + '</td>' +
									'<td>' + "N/A" +'</td>' + 
									'<td>' + "N/A" + '</td>' + 
									'<td>' + "N/A" + '</td>' +
									'<td>' + "N/A" + '</td>' +
									'</td>' +
									'</table>' + 
									'</body>' +
									'</html>';
			res.send(defaultResponse);
		});
	});	
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
		// "a:contains('" + req.params.partnum + "')"   
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
			if($(".Thumbnails").length > 0 ){
				$(".Thumbnails").find("img").each(function(i, elem){
					images[i] = "http://www.fordparts.com" + ($(this).attr("src").replace("&dw=42&dh=42","&dw=0&dh=0"));
				});
			}
			else if ($(".MediumImage").length > 0){
				images[0] = "http://www.fordparts.com" + $(".MediumImage").find("img").attr("src").replace("&dw=150&dh=150","&dw=0&dh=0");
			}
			else{
				images[0] = "N/A";
			}
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
		.then(function (result) {
		res.send(result);
		console.log("Results sent to browser.");
		})
		.catch(function (error) {
			console.error('Search failed:', error);
			var defaultResponse = '<!DOCTYPE html>' +
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
									'<tr>' +
									'<td>' + "N/A" + '</td>' +
									'<td>' + "N/A" +'</td>' + 
									'<td>' + "N/A" + '</td>' + 
									'<td>' + "N/A" + '</td>' +
									'</td>' +
									'</table>' + 
									'</body>' +
									'</html>';
			res.send(defaultResponse);
		});
	});
});
app.get('/cardone/:partnum', function(req, res){
	var url = "https://www.cardone.com/Products/Product-Detail?productId=" + req.params.partnum
	request(url, function(error, response, html){
		var $ = cheerio.load(html,{
			normalizeWhitespace: true
		});
		if (error) throw error;
		nightmare
		.goto(url) 
		.wait('.partThumbs')
		.evaluate(function () {
			var productInfo = '<!DOCTYPE html>' +
							  '<html>' + 
							  '<head>' +
							  '</head>'+
							  '<body>' +
							  '<table>'+
								'<tr>'+
								'<th> Part Number </th>' +
								'<th> PicURLs </th>' +
								'</tr>' +
								'<tr>';
			var Part = $("span:contains('Part Number')").text().replace("Part Number: ", "");
			var images = [];
			if($(".partThumbs a").length > 0 ){
				$(".partThumbs").find("img").each(function(i, elem){
					images[i] = $(this).attr("src");
				});
			}
			else if ($("#cph_Content_C001_partImageWrap").length > 0){
				images[0] = $("#cph_Content_C001_partImageWrap").find("img").attr("src");
			}
			else{
				images[0] = "N/A";
			}
			productInfo += '<td>' + Part + '</td>' +
						   '<td>' + images.join("|") + '</td>' +
						   '</td>' +
						   '</table>' + 
						   '</body>' +
						   '</html>';


			return productInfo;
			

		})
		.then(function (result) {
		res.send(result);
		console.log("Results sent to browser.");
		})
		.catch(function (error) {
			console.error('Search failed:', error);
			var defaultResponse = '<!DOCTYPE html>' +
								  '<html>' + 
								  '<head>' +
								  '</head>'+
								  '<body>' +
								  '<table>'+
									'<tr>'+
									'<th> Part Number </th>' +
									'<th> PicURLs </th>' +
									'</tr>' +
									'<tr>' +
									'<td>' + "N/A" + '</td>' +
									'<td>' + "N/A" + '</td>' +
									'</td>' +
									'</table>' + 
									'</body>' +
									'</html>';
			res.send(defaultResponse);
		});
	});
});