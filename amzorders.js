var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var fs = require('fs');
var csv = require('csv-stringify');
var Nightmare = require('nightmare');       
var nightmare = Nightmare({ show: true });
var request = require('request');
var url = "https://www.ultrarev.tk/admin/ebayamzpos.php";
//var url2 = "https://skyjacker.com/s?=";
var cheerio = require('cheerio');

var app = express();
var PORT = process.env.PORT||8010;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));


// LISTENER
app.listen(PORT, function(){
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});


app.get('/amazon', function(req, res){
	
	request(url, function(error, response, html){
		var $ = cheerio.load(html,{
			normalizeWhitespace: true
		});
		if (error) throw error;
		nightmare
		.goto(url) //
		.select('select','amazon')
		.type("#transactionid_input","109-1665274-8878634") 
		.evaluate(function () {
			return (["amzid","oid"]);
		})
		.then(function (result) {
			res.send("order number saved");
			csv(result, function(err, output){
				fs.appendFile('amazon_orders.txt', output, (err) => {
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
		})
	});	
});

