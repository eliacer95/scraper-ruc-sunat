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

var leap = 0;
var BASE    = "http://www.sunat.gob.pe/cl-ti-itmrconsruc";
var RUC_URL = BASE + "/jcrS00Alias";
var RUC_URL_DETAIL = BASE + "/jcrS00Alias";

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
  for ( var i=0; i <= len ; i++ ){
	if ( dato.charAt(i) != " " || dato.charAt(i) != "," ){
	  	cadena2+=dato.charAt(i);	
	  }
	}
  return cadena2;
}

function clean(dato){
	var cadena2 = "";
  	var cont_space = 0;
  	var len = dato.length;
  	for (var i=0; i <= len ; i++){
  		if (dato.charAt(i) == " "){
	   		cont_space++;
	   		if (cont_space == 1 && i != 0) {
	   			cadena2+=dato.charAt(i);
	   		}
	   	}else{
	   		cadena2+=dato.charAt(i);
	   		cont_space = 0;
	   	}
	}
  return cadena2;
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

//These functions parse data from plain text to object
function getBasicInformation(html , callback) {
	
	try {
		var $             					= cheerio.load(html);
		var table         					= $("table").first().children("tr");
		var contributor 					= {};
		var ruc_rz 							= table.eq(0).children().eq(1).text().trim();
		var data_ruc 						= ruc_rz.split("-");
		var data_rz							= ruc_rz.split(data_ruc[0]+"-");
		contributor.ruc                		= data_ruc[0].trim();
		contributor.social_reason       	= data_rz[1];
		contributor.contributor_type 		= table.eq(1).children().eq(1).text().trim();
		var aux						   		= table.eq(2).children().eq(1).text().trim();
		var legalRep 						= {};
		
		if(contributor.contributor_type.search("PERSONA") > -1 || aux.search("DNI") > -1){
			var personal_information 	= aux.split("-");
			var temp 					= personal_information[0].trim().split(" ");
			legalRep.document_type 		= temp[0].trim();
			legalRep.nro_doc 			= temp[2].trim();
			legalRep.full_name			= personal_information[1].trim();

			leap = 1; // 

			if (table.eq(8+leap).children().length>3) {
				legalRep.job_occupation = table.eq(8+leap).children().eq(3).text().trim();
			} else {
				legalRep.job_occupation	= null;
			}
			contributor.legalRep = legalRep;
		}else{
			contributor.legalRep = legalRep;
		}

		contributor.business_name   		= table.eq(2+leap).children().eq(1).text().trim();
		if (table.eq(2+leap).children().length>3) {
			contributor.affection_new_rus  	= table.eq(2+leap).children().eq(3).text().trim();
		} else {
			contributor.affection_new_rus	= '';
		}

		contributor.registration_date  		= table.eq(3+leap).children().eq(1).text().trim();
		if (table.eq(3+leap).children().length>3) {
			contributor.activity_start_date = table.eq(3+leap).children().eq(3).text().trim();
		} else {
			contributor.activity_start_date	= '';
		}

		contributor.status               	= table.eq(4+leap).children().eq(1).text().trim();
		if (table.eq(4+leap).children().length>3) {
			contributor.leaving_date	  	= table.eq(4+leap).children().eq(3).text().trim();
		} else {
			contributor.leaving_date		= '';
		}

		contributor.condition            	= table.eq(5+leap).children().eq(1).text().trim();
		contributor.fiscal_address		   	= table.eq(6+leap).children().eq(1).text().trim();
		
		contributor.voucher_emission_system	= table.eq(7+leap).children().eq(1).text().trim();
		if (table.eq(7+leap).children().length>3) {
			contributor.foreign_trade_activity 	= table.eq(7+leap).children().eq(3).text().trim();
		} else {
			contributor.foreign_trade_activity	= '';
		}

		contributor.accounting_system		= table.eq(8+leap).children().eq(1).text().trim();
		
		var object = {
			ruc 				: contributor.ruc.toString(),
			social_reason		: clean(contributor.social_reason.toString()),
			contributor_type	: clean(contributor.contributor_type.toString()),
			legalRep       		: contributor.legalRep,
			business_name		: clean(contributor.business_name.toString()),
			affection_new_rus	: contributor.affection_new_rus.toString(),
			registration_date	: clean(contributor.registration_date.toString()),
			activity_start_date	: clean(contributor.activity_start_date.toString()),
			status 				: clean(contributor.status.toString()),
			leaving_date		: clean(contributor.leaving_date.toString()),
			condition			: clean(contributor.condition.toString()),
			fiscal_address		: clean(contributor.fiscal_address.toString()),
			voucher_emission_system	: clean(contributor.voucher_emission_system.toString()),
			foreign_trade_activity	: clean(contributor.foreign_trade_activity.toString()),
			accounting_system		: clean(contributor.accounting_system.toString())
		}
		return callback(null , object , html);
	} catch (e) {
		console.log('Error on parse');
		return callback(e);
	}
}

function getExtendedInformation(html , callback) {
	try {
		var $     								= cheerio.load(html);
		var table 								= $("table").first().children("tr");
		var contributor  						= {};
		var cant_characteres_date = 10;
		
		var ec_act 	= table.eq(9+leap).children().eq(1).children().eq(0).children().map(function () {
			return $(this).text().trim();
		}).get();
		var array_ec_act = [];
		
		for (var i = 0; i < ec_act.length; i++) {
			var aux				= {};
			aux.code 			= ec_act[i].split('- ')[0].trim();
			aux.description 	= ec_act[i].split('- ')[1].trim();
			array_ec_act.push(aux);
		}

		contributor.economic_activities = array_ec_act;

		var authorized_vouchers = table.eq(10+leap).children().eq(1).children().eq(0).children().map(function () {
			return $(this).text().trim();
		}).get();

		if (table.eq(10+leap).children().eq(1).children().eq(0).children().length == 1) {
			if (authorized_vouchers.toString().search('NINGUNO') == -1) {
				contributor.authorized_vouchers	= authorized_vouchers.toString();
			} else {
				contributor.authorized_vouchers	= [];
			}
		} else {
			contributor.authorized_vouchers	= authorized_vouchers;
		}

		contributor.electronic_emission_system	= table.eq(11+leap).children().eq(1).children().eq(0).children().map(function () {
			return $(this).text().trim();
		}).get();

		contributor.electronic_emission_date	= table.eq(12+leap).children().eq(1).text().trim();
		
		var el_vch_temp 		= table.eq(13+leap).children().eq(1).text().trim();
		var object = [];
		if (el_vch_temp!='-') {
			var el_vch 			= el_vch_temp.split(',');
			for (var i = 0; i < el_vch.length; i++) {
				var array_el_vch 	= {};
				array_el_vch.voucher_type = el_vch[i].split(' (')[0];
				array_el_vch.date 	= el_vch[i].substr(el_vch[i].length-(cant_characteres_date+1), cant_characteres_date);
				object.push(array_el_vch);
			}
			contributor.electronic_vouchers = object;
		} else {
			contributor.electronic_vouchers = object;
		}
		
		contributor.ple_affiliation		   	= table.eq(14+leap).children().eq(1).text().trim();
		var standards	= table.eq(15+leap).children().eq(1).children().eq(0).children().map(function () {
			return $(this).text().trim();
		}).get();
		
		if (table.eq(15+leap).children().eq(1).children().eq(0).children().length == 1) {
			if (standards.toString().search('NINGUNO') == -1) {
				contributor.standards	= standards.toString();
			} else {
				contributor.standards	= [];
			}
		} else {
			contributor.standards	= standards;
		}
		
		var object = {
			economic_activities		: contributor.economic_activities,
			authorized_vouchers		: contributor.authorized_vouchers,
			electronic_emission_system	: contributor.electronic_emission_system,
			electronic_emission_date: clean(contributor.electronic_emission_date.toString()),
			electronic_vouchers		: contributor.electronic_vouchers,
			ple_affiliation			: clean(contributor.ple_affiliation.toString()),
			standards				: contributor.standards
		}
		return callback(null , object , html);
	} catch ( e ) {
		return callback(e);
	}
}

function getLegalRepresentative(html , callback) {
	try {
		var $	             				= cheerio.load(html);
		var table = $('table:nth-of-type(2) tr td tr td table');
		var object 						= [];
		for (var i = 1; i < table.children().length; i++) {
			var legalRep				= {};
			legalRep.document_type		= clean(table.children().eq(i).children().eq(0).text().trim());
			legalRep.nro_doc			= clean(table.children().eq(i).children().eq(1).text().trim());
			legalRep.full_name			= clean(table.children().eq(i).children().eq(2).text().trim());
			legalRep.position			= clean(table.children().eq(i).children().eq(3).text().trim());
			legalRep.date_from			= clean(table.children().eq(i).children().eq(4).text().trim());
			object.push(legalRep);
		}		
		return callback(null , object , html);
	} catch (e) {
		console.log('Error en parseo');
		return callback(e);
	}
}

function getHistoricInformation(html , callback) {
	try {
		var $	             	= cheerio.load(html);
		var table_base 			= $('table:nth-of-type(2)').find('table');
		var table_rz 			= table_base.children().eq(0).find('table');
		var table_condition 	= table_base.children().eq(2).find('table');
		var table_loc_anex 		= table_base.children().eq(4).find('table');
		
		var hist_rz				= [];
		var hist_cond			= [];
		var hist_loc_anex		= [];

		//Historic social reason
		if (table_rz.children().length >= 2) {
			for (var i = 1; i < table_rz.children().length; i++) {
				var temp = {};
				var aux  = table_rz.children().eq(i).children().eq(0).text().trim();
				if (aux.search('No hay') == -1) {
					temp.social_reason  = clean(table_rz.children().eq(i).children().eq(0).text().trim());
					temp.leaving_date  = clean(table_rz.children().eq(i).children().eq(1).text().trim());
					hist_rz.push(temp);
				} else {
					hist_rz = temp;
				}
			}
		}
		
		//Historic condition...
		if (table_condition.children().length >= 2) {
			for (var i = 1; i < table_condition.children().length; i++) {
				var temp = {};
				var aux  = table_condition.children().eq(i).children().eq(0).text().trim();
				if (aux.search('No hay') == -1) {
					temp.condition  = clean(table_condition.children().eq(i).children().eq(0).text().trim());
					temp.date_from  = clean(table_condition.children().eq(i).children().eq(1).text().trim());
					temp.date_to	= clean(table_condition.children().eq(i).children().eq(2).text().trim());
					hist_cond.push(temp);
				} else {
					hist_cond = temp;
				}
			}
		}

		//Historic leaving date by attachment locals
		if (table_loc_anex.children().length >= 2) {
			for (var i = 1; i < table_loc_anex.children().length; i++) {
				var temp = {};
				var aux  = table_loc_anex.children().eq(i).children().eq(0).text().trim();
				if (aux.search('No hay') == -1) {
					temp.address_local_anex  = clean(table_loc_anex.children().eq(i).children().eq(0).text().trim());
					temp.leaving_date		 = clean(table_loc_anex.children().eq(i).children().eq(1).text().trim());
					hist_loc_anex.push(temp);
				} else {
					hist_loc_anex = temp;
				}
			}
		}

		var object 	= {
			hist_rz			: hist_rz,
			hist_cond		: hist_cond,
			hist_loc_anex	: hist_loc_anex
		};

		return callback(null , object , html);
	} catch (e) {
		console.log('Error en parseo');
		return callback(e);
	}
}

function getCoactiveDebt(html , callback) {
	try {
		var $	             				= cheerio.load(html);
		cheerioTableparser($);
		var table = $('table:nth-of-type(2) tr td tr td table');
		
		var object 						= [];
		console.log('count:'+table.children().length);
		for (var i = 1; i < table.children().length; i++) {
			var legalRep					= {};
			legalRep.document_type		= table.children().eq(i).children().eq(0).text().trim();
			legalRep.nro_doc			= table.children().eq(i).children().eq(1).text().trim();
			legalRep.full_name			= table.children().eq(i).children().eq(2).text().trim();
			legalRep.position			= table.children().eq(i).children().eq(3).text().trim();
			legalRep.date_from			= table.children().eq(i).children().eq(4).text().trim();
			object.push(legalRep);
		}		
		return callback(null , object , html);
	} catch (e) {
		console.log('Error en parseo');
		return callback(e);
	}
}

function getTaxOmissions(html , callback) {
	try {
		var $	             				= cheerio.load(html);
		cheerioTableparser($);
		var table = $('table:nth-of-type(2) tr td tr td table');
		
		var object 						= [];
		console.log('count:'+table.children().length);
		for (var i = 1; i < table.children().length; i++) {
			var legalRep					= {};
			legalRep.document_type		= table.children().eq(i).children().eq(0).text().trim();
			legalRep.nro_doc			= table.children().eq(i).children().eq(1).text().trim();
			legalRep.full_name			= table.children().eq(i).children().eq(2).text().trim();
			legalRep.position			= table.children().eq(i).children().eq(3).text().trim();
			legalRep.date_from			= table.children().eq(i).children().eq(4).text().trim();
			object.push(legalRep);
		}		
		return callback(null , object , html);
	} catch (e) {
		console.log('Error en parseo');
		return callback(e);
	}
}

function getNumberOfWorkers(html , callback) {
	try {
		var $	             				= cheerio.load(html);
		var table = $('table:nth-of-type(3) table');
		var object 						= [];
		for (var i = 2; i < table.children().length; i++) {
			var cantTrab						= {};
			cantTrab.period						= table.children().eq(i).children().eq(0).text().trim();
			cantTrab.number_workers				= table.children().eq(i).children().eq(1).text().trim();
			cantTrab.number_pensioners			= table.children().eq(i).children().eq(2).text().trim();
			cantTrab.number_service_providers	= table.children().eq(i).children().eq(3).text().trim();
			object.push(cantTrab);
		}	
		return callback(null , object , html);
	} catch (e) {
		console.log('Error en parseo');
		return callback(e);
	}
}

function getProbatoryActs(html , callback) {
	try {
		var $	             				= cheerio.load(html);
		var table = $('#print').find('table').find('table').find('table');
		var object 				= [];
		
		for (var i = 1; i < table.children().length; i++) {
			var actPro		= {};
			var aux			= table.children().eq(i).children().eq(0).text().trim();
			if (table.children().eq(i).children().length > 1 || aux.search('No existe') == -1) {
				actPro.number				= table.children().eq(i).children().eq(0).text().trim();
				actPro.date					= table.children().eq(i).children().eq(1).text().trim();
				actPro.intervention_place	= table.children().eq(i).children().eq(2).text().trim();
				actPro.art_nro_infraction	= table.children().eq(i).children().eq(3).text().trim();
				actPro.description_infraction	= table.children().eq(i).children().eq(4).text().trim();
				actPro.nro_riz_roz			= table.children().eq(i).children().eq(5).text().trim();
				actPro.type_riz_roz			= table.children().eq(i).children().eq(6).text().trim();
				actPro.recognition_act		= table.children().eq(i).children().eq(7).text().trim();
				object.push(actPro);
			} else {
				break;
			}
		}		
		return callback(null , object , html);
	} catch (e) {
		console.log('Error en parseo');
		return callback(e);
	}
}

function getLocalAttachments(html , callback) {
	try {
		var $	             				= cheerio.load(html);
		var table = $('#print').find('table').find('table');
		var object 						= [];
		for (var i = 2; i < table.children().length; i++) {
			var locAnex					= {};
			locAnex.code				= clean(table.children().eq(i).children().eq(0).text().trim());
			locAnex.attachment_type		= clean(table.children().eq(i).children().eq(1).text().trim());
			locAnex.address				= clean(table.children().eq(i).children().eq(2).text().trim());
			locAnex.economic_activity	= clean(table.children().eq(i).children().eq(3).text().trim());
			object.push(locAnex);
		}		
		return callback(null , object , html);
	} catch (e) {
		console.log('Error en parseo');
		return callback(e);
	}
}

//This function get Captcha...
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

//This functions get source code with all information about a ruc. It is a plain text
function getHtmlPageInfo(ruc , cb) {
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

function getHtmlPageDetailed(ruc, desRuc, action, cb) {
	request.post(RUC_URL_DETAIL , {
		form : {
			"nroRuc" : ruc ,
			"accion" : action ,
			"desRuc" : desRuc
		}
	} , function (err , response , body) {
		if ( err ) {
			return cb(err);
		} else {
			return cb(null , body.toString());
		}
	});
}

//These functions get Information from SUNAT web page
Scraper.prototype.getInformation = function (ruc , cb) {
	
	getHtmlPageInfo(ruc , function (err , body) {
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

Scraper.prototype.getRepLeg = function (ruc ,desRuc, cb) {
	
	var action = 'getRepLeg';
	
	getHtmlPageDetailed(ruc, desRuc, action,function (err , body) {
		if ( err ) {
			return cb(err);
		}
		getLegalRepresentative(body , function (err , data) {
			if ( err ) {
				return cb(err);
			} else {
				return cb(null , data , body);
			}
		});
	});
}

Scraper.prototype.getInfHis = function (ruc ,desRuc, cb) {
	
	var action = 'getinfHis';
	
	getHtmlPageDetailed(ruc, desRuc, action,function (err , body) {
		if ( err ) {
			return cb(err);
		}
		getHistoricInformation(body , function (err , data) {
			if ( err ) {
				return cb(err);
			} else {
				return cb(null , data , body);
			}
		});
	});
}

Scraper.prototype.getCantTrab = function (ruc ,desRuc, cb) {
	
	var action = 'getCantTrab';
	
	getHtmlPageDetailed(ruc, desRuc, action,function (err , body) {
		if ( err ) {
			return cb(err);
		}
		getNumberOfWorkers(body , function (err , data) {
			if ( err ) {
				return cb(err);
			} else {
				return cb(null , data , body);
			}
		});
	});
}

Scraper.prototype.getActPro = function (ruc ,desRuc, cb) {
	
	var action = 'getActPro';
	
	getHtmlPageDetailed(ruc, desRuc, action,function (err , body) {
		if ( err ) {
			return cb(err);
		}
		getProbatoryActs(body , function (err , data) {
			if ( err ) {
				return cb(err);
			} else {
				return cb(null , data , body);
			}
		});
	});
}

Scraper.prototype.getLocAnex = function (ruc ,desRuc, cb) {
	
	var action = 'getLocAnex';
	
	getHtmlPageDetailed(ruc, desRuc, action,function (err , body) {
		if ( err ) {
			return cb(err);
		}
		getLocalAttachments(body , function (err , data) {
			if ( err ) {
				return cb(err);
			} else {
				return cb(null , data , body);
			}
		});
	});
}

module.exports = new Scraper();