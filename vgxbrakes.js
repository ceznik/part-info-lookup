var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');



var Nightmare = require('nightmare');       
var nightmare = Nightmare({ show: true });
var request = require('request');
var url = "http://vgxbrakes.com/parts/";
var cheerio = require('cheerio');

var app = express();
var PORT = process.env.PORT||8020;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));


// LISTENER
app.listen(PORT, function(){
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

app.get('/vgxbrakes/:partnum', function(req, res){
	var url = "http://vgxbrakes.com/parts/" + req.params.partnum;
	request(url, function(error, response, html){
		var $ = cheerio.load(html,{
			normalizeWhitespace: true
		});
		if (error) throw error;
		nightmare
		.goto(url)
		.evaluate(function () {
			var productInfo = '<!DOCTYPE html>' +
							  '<html>' + 
							  '<head>' +
							  '</head>'+
							  '<body>' +
							  '<table>'+
								'<tr>'+
								'<th> Part Number </th>' +
								'<th> Description </th>' +
								'<th> Weight </th>' +
								'<th> UPC </th>' +
								'<th> Image </th>' + 
								'</tr>' +
								'<tr>';
			var Part = document.getElementsByClassName("partNumber")[0].innerHTML;
			var Description = document.getElementsByClassName("partDescription")[0].innerHTML;
			var Weight = document.getElementsByClassName("vgxWeight")[0].childNodes[3].innerHTML;
			var UPC = document.getElementsByClassName("vgxupc")[0].childNodes[2].innerHTML;
			var image = document.getElementsByClassName("partImage")[0].children[0].children[0].src;
			productInfo += '<td>' + Part + '</td>' +
						   '<td>' + Description + '</td>' +
						   '<td>' + Weight +'</td>' + 
						   '<td>' + UPC + '</td>' + 
						   '<td>' + image + '</td>' +
						   '</td>' +
						   '</table>' + 
						   '</body>' +
						   '</html>';

			url = "http://vgxbrakes.com/parts/";
			return productInfo;
			

		})
		.then(function (result) {
			res.send(result);
			console.log("Results sent to browser.");
		})
		.catch(function (error) {
			var productInfo = '<!DOCTYPE html>' +
							  '<html>' + 
							  '<head>' +
							  '</head>'+
							  '<body>' +
							  '<table>'+
								'<tr>'+
								'<th> Part Number </th>' +
								'<th> Description </th>' +
								'<th> Weight </th>' +
								'<th> UPC </th>' +
								'<th> Image </th>' + 
								'</tr>' +
								'<tr>' +	
								'<td> N/A  </td>' +
								'<td> N/A  </td>' +
								'<td> N/A </td>' + 
								'<td> N/A  </td>' + 
								'<td> N/A  </td>' +
								'</td>' +
								'</table>' + 
								'</body>' +
								'</html>';		
		res.send(productInfo);
		console.error('Search failed:', error);
		});
	});
});


