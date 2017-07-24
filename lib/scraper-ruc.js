"use strict";
var request = require("request");
var cheerio = require("cheerio");

var opts = {
	jar      : true ,
	timeout  : 10000 ,
	encoding : null ,
	headers  : {
		'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36'
	}
};
var request_ = request;
request = request.defaults(opts);

function Scraper() {
}

Scraper.prototype.addRegister = function (url, data) {
	var options = 
	{ 
		method: 'POST',
		url: url,
		headers:
		{ 'cache-control': 'no-cache',
		  'content-type': 'application/x-www-form-urlencoded' 
		},
		form: data
	};

	request_(options, function (error, response, body) {
	  if (error) throw new Error(error);
	  if (!error && response.statusCode == 200) {
	  	console.log('succesfull post...');
	    console.log(body);
	  }
	  console.log(body);
	});	
}

function getBasicInformation(html , callback) {
	
	try {
		var $             					= cheerio.load(html);
		var table         					= $("table").first().children("tr");
		var contributor 					= {};
		
		var ruc_rz 							= table.eq(1).children().eq(1).text().trim();
		var datos 							= ruc_rz.split("-");
		contributor.ruc                		= datos[0];
		contributor.social_reazon       	= datos[1];
		contributor.contributor_type 		= table.eq(2).children().eq(1).text().trim();
		contributor.business_name   		= table.eq(3).children().eq(1).text().trim();
		contributor.registration_date  		= table.eq(4).children().eq(1).text().trim();
		contributor.status               	= table.eq(5).children().eq(1).text().trim();
		contributor.condition            	= table.eq(6).children().eq(1).text().trim();
		contributor.fiscal_address		   	= table.eq(7).children().eq(1).text().trim();
		var objeto = {
			ruc: contributor.ruc,
			social_reazon: contributor.social_reazon,
			contributor_type: contributor.contributor_type,
			business_name: contributor.business_name,
			registration_date: contributor.registration_date,
			status:contributor.status,
			condition: contributor.condition,
			fiscal_address: contributor.fiscal_address
		}
		return callback(null , objeto , html);
	} catch (e) {
		console.log('Error en parseo');
		return callback(e);
	}
	
}

function getExtendedInformation(html , callback) {
	try {
		var $     								= cheerio.load(html);
		var table 								= $("table").first().children("tr");
		var contributor  						= {};
		
		contributor.economic_activities   		= table.eq(8).children().eq(1).children().eq(0).children().map(function () {
			return $(this).text().trim();
		}).get();
		contributor.authorized_vouchers			= table.eq(9).children().eq(1).children().eq(0).children().map(function () {
			return $(this).text().trim();
		}).get();
		contributor.electronic_vouchers			= table.eq(10).children().eq(1).text().trim();
		contributor.ple_affiliation		   	 	= table.eq(11).children().eq(1).text().trim();
		contributor.standards   				= table.eq(12).children().eq(1).children().eq(0).children().map(function () {
			return $(this).text().trim();
		}).get();

		var objeto = {
			economic_activities: contributor.economic_activities,
			authorized_vouchers: contributor.authorized_vouchers,
			electronic_vouchers: contributor.electronic_vouchers,
			ple_affiliation: contributor.ple_affiliation,
			standards: contributor.standards
		}
		return callback(null , objeto , html);
	} catch ( e ) {
		return callback(e);
	}
}

function getCaptcha(base , cb) {
	var URL         = "/captcha";
	var CAPTCHA_URL = base + URL;
	request.post(CAPTCHA_URL , {form : {"accion" : "random"}}, function (err , response , body) {
		if (err) {
			return cb(err);
		} else {
			return cb(null , body.toString());
		}
	});
}


function getHtmlPage(ruc , cb) {
	var BASE    = "http://www.sunat.gob.pe/cl-ti-itmrconsruc";
	var RUC_URL = BASE + "/jcrS03Alias";
	getCaptcha(BASE , function (err , captcha) {
		request.post(RUC_URL , {
			form : {
				"nroRuc" : ruc ,
				"accion" : "consPorRuc" ,
				"numRnd" : captcha
			}
		} , function (err , response , body) {
			if ( err ) {
				return cb(err);
			} else {
				return cb(null , body.toString());
			}
		});
	});
}

Scraper.prototype.getInformation = function (ruc , cb) {
	
	getHtmlPage(ruc , function (err , body) {
		if ( err ) {
			return cb(err);
		}
		getBasicInformation(body , function (err , data) {
			if ( err ) {
				return cb(err);
			} else {
				return cb(null , data , body);
			}
		});
	});
}

Scraper.prototype.getAllInformation = function (ruc , cb) {

	this.getInformation(ruc , function (err , basicInformation , body) {
		if ( err ) {
			return cb(err);
		} else {
			if (!Object.keys(basicInformation).length ) {
					return cb(null , basicInformation);
				}

			getExtendedInformation(body , function (err , extendedInformation) {
				if ( err ) {
					return cb(err);
				} else {
					return cb(null , Object.assign(basicInformation , extendedInformation) , body);
				}
			});
		}
	});

}

module.exports = new Scraper();