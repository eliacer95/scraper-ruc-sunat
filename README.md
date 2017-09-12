# scraper-ruc-sunat

## Installation
```
npm install scraper-ruc-sunat
```
## Usage
```
var scraper = require("scraper-ruc-sunat");

scraper.getInformation("20131312955" , function (err, data) {
	if (err) {
		console.error(err);
	} else {
    	console.log(data);

      //Here you can use an other function. For example, if you have to get Legal Representative:

      scraper.getRepLeg(data.ruc, data.social_reason, function (err, object) {
        if ( err ) {
          console.error(err);
        }else{
          console.log(object);
        }
      });

		
	}
});

```

## Features

* scraper.getInformation(ruc,cb) => basic information
* scraper.getAllInformation(ruc,cb) => extended information
* scraper.getRepLeg(ruc, social_reason) => legal representative (s)
* scraper.getLocAnex(ruc, social_reason) => local attachments
* scraper.getCantTrab(ruc, social_reason) => Number of workers
* scraper.getActPro(ruc, social_reason) => Probatory acts
* scraper.getInfHis(data.ruc, data.social_reason) => Historic information


### Basic information

```
{
  'ruc': '20131312955',
  'social_reason': 'SUPERINTENDENCIA NACIONAL DE ADUANAS Y DE ADMINISTRACION TRIBUTARIA - SUNAT',
  'contributor_type': 'INSTITUCIONES PUBLICAS',
  'legalRep': {},
  'business_name': '-',
  'affection_new_rus': '',
  'registration_date': '04/05/1993',
  'activity_start_date': '09/06/1988',
  'status': 'ACTIVO',
  'leaving_date': '',
  'condition': 'HABIDO',
  'fiscal_address': 'AV. GARCILASO DE LA VEGA NRO. 1472 LIMA - LIMA - LIMA',
  'voucher_emission_system': 'MANUAL/COMPUTARIZADO',
  'foreign_trade_activity': 'SIN ACTIVIDAD',
  'accounting_system': 'COMPUTARIZADO'
}

```

### More information

```
{
  ...
  'economic_activities': [ 'ACTIV. ADMINIST. PUBLICA EN GENERAL' ],
  'authorized_vouchers':
     [ 'FACTURA',
       'BOLETA DE VENTA',
       'NOTA DE CREDITO',
       'NOTA DE DEBITO',
       'GUIA DE REMISION - REMITENTE',
       'COMPROBANTE DE RETENCION',
       'POLIZA DE ADJUDICACION POR REMATE DE BIENES' ],
  'electronic_emission_system':
     [ 'FACTURA PORTAL                      DESDE 07/08/2013',
       'BOLETA PORTAL                       DESDE 01/04/2016' ],
  'electronic_emission_date': '07/08/2013',
  'electronic_vouchers':
     [ { voucher_type: 'FACTURA', date: '07/08/2013' },
       { voucher_type: 'BOLETA', date: '01/04/2016' } ],
  'ple_affiliation': '01/01/2013',
  'standards': [ 'Incorporado al Régimen de Agentes de Retención de IGV (R.S.037-2002) a partir del 01/06/2002' ] 
}

```
### Legal Representatives

```
[ { document_type: 'DNI',
    nro_doc: '10168821',
    full_name: 'CONTRERAS CASTRO TEODOSIA MAXIMINA',
    position: 'REPRESENTANTE DE UNIVERSIDADES',
    date_from: '19/01/2013' },
  { document_type: 'DNI',
    nro_doc: '10323468',
    full_name: 'ACU�A HURTADO NILTON',
    position: 'GERENTE GENERAL',
    date_from: '03/08/2016' },
  { document_type: 'DNI',
    nro_doc: '42514780',
    full_name: 'TICONA MAMANI SARA FLOR',
    position: 'GERENTE',
    date_from: '01/01/2016' } 
]

```
## Requirements

* Nodejs >= 0.12


