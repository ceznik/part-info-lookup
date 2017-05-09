var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');



var Nightmare = require('nightmare');       
var nightmare = Nightmare({ show: true });
var request = require('request');
var cheerio = require('cheerio');
var url = "http://www.wilwood.com/Index.aspx";

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

app.get('/wildwood/:partnum', function(req, res){
	request(url, function(error, response, html){
		var $ = cheerio.load(html,{
			normalizeWhitespace: true
		});
		if (error) throw error;
		nightmare
		.goto(url)
		.type('#ctl00_txtPartNo', req.params.partnum) // 
		.click('#ctl00_lkbtnGo') // 
		.wait('.ctl00_ContentPlaceHolder1_pnlProducts')
		.click('.Blue10B:contains["'+ req.params.partnum + '"] > a')
		// "a:contains('" + req.params.partnum + "')"   
		.wait('.ctl00_ContentPlaceHolder1_PanelPage')
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
								'<tr>' +
								'<td>' + Part + '</td>' +
								'<td>' + Weight +'</td>' + 
								'<td>' + Dimensions + '</td>' + 
								'<td>' + images.join("|") + '</td>' +
								'</td>' +
								'</table>' + 
								'</body>' +
								'</html>';
			var Part = $("a:contains('" + req.params.partnum + '")').text();
			var Weight = $("#divWeight").text().replace("Weight: ", "");
			var Dimensions = $("#divDimensions").text().replace("Dimensions: ", "");
			var images = [];
			var productInfo = '<!DOCTYPE html>' +
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
						   '<td>' + "Weight" +'</td>' + 
						   '<td>' + "Dimensions" + '</td>' + 
						   '<td>' + "Images" + '</td>' +
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
								'<td>' + "Part" + '</td>' +
								'<td>' + "Weight" +'</td>' + 
								'<td>' + "Dimensions" + '</td>' + 
								'<td>' + "Images" + '</td>' +
								'</td>' +
								'</table>' + 
								'</body>' +
								'</html>';
		res.send(defaultResponse);
		});
	});
});
