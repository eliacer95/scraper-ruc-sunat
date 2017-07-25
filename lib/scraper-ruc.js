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

var salto = 0;

function Scraper() {
}

Scraper.prototype.esrucok = function(dato){
  	return (!( esnulo(dato) || !esnumero(dato) || !eslongrucok(dato) || !valruc(dato) ));
}
function esnulo(dato){ 
	return (dato == null||dato=="");
}
function esnumero(dato){ 
	return (!( isNaN(dato) ));
}
function eslongrucok(dato){
	return (dato.length == 11);
}

function trim(dato){
  var cadena2 = "";
  var len = dato.length;
  for ( var i=0; i <= len ; i++ ) if ( dato.charAt(i) != " " ){cadena2+=dato.charAt(i);	}
  return cadena2;
}

function clean(dato){
	var cadena2 = "";
  	var cont_space = 0;
  	var len = dato.length;
  	for (var i=0; i <= len ; i++){
  		if (dato.charAt(i) == " "){
	   		cont_space++;
	   		if (cont_space == 1) {
	   			cadena2+=dato.charAt(i);
	   		}
	   	}else{
	   		cadena2+=dato.charAt(i);
	   		cont_space = 0;
	   	}
	}
  return cadena2;
}

function longitudmayor( campo, len ){
  return ( campo != null )? (campo.length > len) : false;
}

function clean_ruc(ruc){
	return ruc.replace(/^\s+|\s+$/g,"");
}

function clean_data(ruc){
	return ruc.replace(/^\s+|\s+$/g," ");
}

function valruc(valor){
  var valor = trim(valor);
  var resto;
  var x;
  var suma;
  var digito;

  if ( esnumero( valor ) ) {
    if ( valor.length == 8 ){
      suma = 0
      for (var i=0; i<valor.length-1;i++){
        digito = valor.charAt(i) - '0';
        if ( i==0 ) suma += (digito*2)
        else suma += (digito*(valor.length-i))
      }
      resto = suma % 11;
      if ( resto == 1) resto = 11;
      if ( resto + ( valor.charAt( valor.length-1 ) - '0' ) == 11 ){
        return true
      }
    } else if ( valor.length == 11 ){
      suma = 0
      x = 6
      for (var i=0; i<valor.length-1;i++){
        if ( i == 4 ) x = 8
        digito = valor.charAt(i) - '0';
        x--
        if ( i==0 ) suma += (digito*x)
        else suma += (digito*x)
      }
      resto = suma % 11;
      resto = 11 - resto
      
      if ( resto >= 10) resto = resto - 10;
      if ( resto == valor.charAt( valor.length-1 ) - '0' ){
        return true
      }      
    }
  }
  return false;
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
		
		var ruc_rz 							= table.eq(1).children().eq(1).text();
		var datos 							= ruc_rz.split("-");
		var personal_information;
		
		contributor.ruc                		= datos[0];
		contributor.social_reason       	= datos[1];
		contributor.contributor_type 		= table.eq(2).children().eq(1).text();
		var aux						   		= table.eq(3).children().eq(1).text();
		
		if(contributor.contributor_type.search("PERSONA") > -1 || aux.search("DNI") > -1){
			personal_information 			= aux.split("-");
			contributor.document_type 		= personal_information[0];
			contributor.owner 				= personal_information[1];
			salto = 1;
		}else{
			contributor.document_type 		= "";
			contributor.owner 				= "";
		}

		contributor.business_name   		= table.eq(3+salto).children().eq(1).text();
		contributor.registration_date  		= table.eq(4+salto).children().eq(1).text();
		contributor.status               	= table.eq(5+salto).children().eq(1).text();
		contributor.condition            	= table.eq(6+salto).children().eq(1).text();
		contributor.fiscal_address		   	= table.eq(7+salto).children().eq(1).text();

		var objeto = {
			ruc 				: trim(contributor.ruc.toString()),
			social_reason		: contributor.social_reason.toString(),
			contributor_type	: contributor.contributor_type.toString(),
			document_type       : contributor.document_type.toString(),
        	owner               : contributor.owner.toString(),
			business_name		: contributor.business_name.toString(),
			registration_date	: contributor.registration_date.toString(),
			status 				: contributor.status.toString(),
			condition			: clean_data(contributor.condition.toString()),
			fiscal_address		: clean(contributor.fiscal_address.toString())
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
		
		contributor.economic_activities   		= table.eq(8+salto).children().eq(1).children().eq(0).children().map(function () {
			return $(this).text();
		}).get();
		contributor.authorized_vouchers			= table.eq(9+salto).children().eq(1).children().eq(0).children().map(function () {
			return $(this).text();
		}).get();
		contributor.electronic_vouchers			= table.eq(10+salto).children().eq(1).text();
		contributor.ple_affiliation		   	 	= table.eq(11+salto).children().eq(1).text();
		contributor.standards   				= table.eq(12+salto).children().eq(1).children().eq(0).children().map(function () {
			return $(this).text();
		}).get();

		var objeto = {
			economic_activities	: clean(contributor.economic_activities.toString()),
			authorized_vouchers	: contributor.authorized_vouchers.toString(),
			electronic_vouchers	: clean(contributor.electronic_vouchers.toString()),
			ple_affiliation		: contributor.ple_affiliation.toString(),
			standards			: contributor.standards.toString()
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