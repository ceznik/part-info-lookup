var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');



var Nightmare = require('nightmare');       
var nightmare = Nightmare({ show: true });
var request = require('request');
var cheerio = require('cheerio');
var url = "http://wwwsc.ekeystone.com/Search/Detail?pid=AUM";

var app = express();
var PORT = process.env.PORT||420;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));


// LISTENER
app.listen(PORT, function(){
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

app.get('/autometer/:partnum', function(req, res){
	console.log("url: " + url+req.params.partnum)
	request(url+req.params.partnum, function(error, response, html){
		var $ = cheerio.load(html,{
			normalizeWhitespace: true
		});
		if (error) throw error;
		nightmare
		.goto(url+req.params.partnum)
		.click('#webcontent_0_row2_0_productDetailBasicInfo_aToggleCost') // 
		.wait('.checkoutTableTitle')
		.evaluate(function () {
			var Part = $("#webcontent_0_row2_0_productDetailBasicInfo_lblPartNumber").text();
			var Price = $("#webcontent_0_row2_0_productDetailBasicInfo_lblMyPrice").text();
			var Status = $("#webcontent_0_row2_0_productDetailBasicInfo_aInventory").text();
			console.log("Part: " + Part + " | " + "Price: " + Price + " | " + "Status" + Status);
			var productInfo = '<!DOCTYPE html>' +
							  '<html>' + 
							  '<head>' +
							  '</head>'+
							  '<body>' +
							  '<table>'+
								'<tr>'+
								'<th> Part Number </th>' +
								'<th> My Price </th>' +
								'<th> Status </th>' +
								'</tr>' +
								'<tr>' +
								'<td>' + Part + '</td>' +
								'<td>' + Price +'</td>' + 
								'<td>' + Status + '</td>' +
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
								'<th> My Price </th>' +
								'<th> Status </th>' +
								'</tr>' +
								'<tr>' +
								'<td>' + "NA" + '</td>' +
								'<td>' + "NA" +'</td>' + 
								'<td>' + "NA" + '</td>' +
								'</td>' +
								'</table>' + 
								'</body>' +
								'</html>';
		res.send(defaultResponse);
		});
	});
});
