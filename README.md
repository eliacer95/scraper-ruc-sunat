# scraper-ruc-sunat

## Installation
```
npm install scraper-ruc-sunat
```
## Usage
```
var scraper = require("scraper-ruc-sunat");

//OPTIONAL
var site_root = 'http://localhost:80/api/contributors';

scraper.getInformation("20131312955" , function (err, data) {
	if (err) {
		console.error(err);
	} else {
    		//All data...
		Object.keys(data).forEach(function(key,index) {
		  console.log(key+": "+data[key]); 
		});
		
		//OPTIONAL
		scraper.addRegister(site_root, data);
	}
});

```

## Features

* scraper.getInformation(ruc,cb) => basic information
* scraper.getAllInformation(ruc,cb) => extended information
* scraper.addRegister(site_root, data) => Send data to API REST

### Basic information

```
[
    {
        "ruc": "20131312955",
        "social_reason": "SUPERINTENDENCIA NACIONAL DE ADUANAS Y DE ADMINISTRACION TRIBUTARIA",
        "contributor_type": "INSTITUCIONES PUBLICAS",
        "document_type": "",
        "owner": "",
        "business_name": "-",
        "registration_date": "04/05/1993",
        "status": "ACTIVO",
        "condition": "HABIDO",
        "fiscal_address": "AV. GARCILASO DE LA VEGA NRO. 1472 LIMA - LIMA - LIMA"
    }
]
```

### More information

```
[
    {
        ...
        "email_address": null,
        "phone": null,
        "economic_activities": "Principal - CIIU 75113 - ACTIV. ADMINIST. PUBLICA EN GENERAL",
        "authorized_vouchers": "FACTURA,BOLETA DE VENTA,NOTA DE CREDITO,NOTA DE DEBITO,GUIA DE REMISION - REMITENTE,COMPROBANTE DE  RETENCION,POLIZA DE ADJUDICACION POR REMATE DE BIENES",
        "electronic_vouchers": "FACTURA PORTAL DESDE 07/08/2013",
        "ple_affiliation": "01/01/2013",
        "standards": "Incorporado al Régimen de Agentes de Retención de IGV (R.S.037-2002) a partir del 01/06/2002"
    }
]
```

## Requirements

* Nodejs >= 0.12


