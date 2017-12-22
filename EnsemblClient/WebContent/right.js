var ensemblClientNamespace = {};

ensemblClientNamespace.wsBaseUrl = "http://rest.ensembl.org/lookup/id/";

ensemblClientNamespace.ensemblData = {};

ensemblClientNamespace.speciesList = new Map();

ensemblClientNamespace.getUrl = function(accessionId) {
	return ensemblClientNamespace.wsBaseUrl + accessionId;
}

ensemblClientNamespace.getField = function(var1, var2) {
	if (var1) return var1;
	else if (var2) return var2;
	else return "";
}

ensemblClientNamespace.callback = function(data) {
	ensemblClientNamespace.ensemblData = data;
	
	if (!data) return;
	if (data.Parent) {
			var url = ensemblClientNamespace.getUrl(data.Parent);
			ensemblClientNamespace.callWS(url, ensemblClientNamespace.callback);
			return;
	}
		
	var type = ensemblClientNamespace.getField(data.object_type);
	var name = ensemblClientNamespace.getField(data.display_name, type);
	var fullDescription = ensemblClientNamespace.getField(data.description);
	var index = fullDescription.indexOf("[");
	var description = fullDescription.substring(0, index);
	var source = fullDescription.substring(index + 1, fullDescription.length - 1);
	
	var speciesCode = ensemblClientNamespace.getField(data.species);
	var speciesDisplay = ensemblClientNamespace.getSpeciesName(speciesCode);
	var biotype = ensemblClientNamespace.getField(data.biotype);
	biotype = biotype.replace("_", " ");
	biotype = ensemblClientNamespace.capitalizeFirstLetter(biotype);

	
	var typeDisplay = speciesDisplay + ' ' + type;
	var biotypeDisplay = biotype + ' ' + type; 
	
	ensemblClientNamespace.completeBox(typeDisplay, name, source, speciesCode, biotypeDisplay,
			description);

	var strand = data.strand;
	var genStart = data.start;
	var genEnd = data.end;
	var region = data.seq_region_name;
	var location = region + ":" + genStart + "-" + genEnd + ":" + strand;

	ensemblClientNamespace.draw_gene($('.rhs_canvas canvas')[0], location,
			name, "#CD9B1D");

	$('.rhs').show();
	
}

ensemblClientNamespace.capitalizeFirstLetter = function(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

ensemblClientNamespace.completeBox = function(type, name, source, species,
		biotype, description) {
	$('.rhs_type').empty();
	$('.rhs_type').append(type);

	$('.rhs_name').empty();
	$('.rhs_name').append(name);

	$('.rhs_source').empty();
	$('.rhs_source').append(source);

	$('.rhs_species').empty();
	$('.rhs_species').append(
			'<img src="https://www.ensembl.org/i/species/64/'
					+ ensemblClientNamespace.capitalizeFirstLetter(species)
					+ '.png">');

	$('.rhs_biotype').empty();
	$('.rhs_biotype').append(biotype);

	$('.rhs_desc').empty();
	$('.rhs_desc').append(description);

}

/**
 * Function to call a Rest Web Service at the endpoint and invoke the callback
 * function to process the results passing the json string returned from WS as
 * function parameter.
 * 
 */
ensemblClientNamespace.callWS = function(endpoint, callback, myData) {
	$.ajax({
		url : endpoint,
		contentType : "application/json",
		headers : {
			"Content-Type" : "application/json"
		},
		beforeSend : function(xhr) {
			xhr.setRequestHeader("Content-Type", "application/json");
		},
		success : function(data) {
			callback(data)
		},
		error: function(jqXHR,error, errorThrown) {  
		}
	});
}

ensemblClientNamespace.draw_gene = function(canvas, location, text, colour) {
	var ctx = canvas.getContext('2d')
	var line = function(ctx, x, y, w, h) {
		ctx.beginPath();
		ctx.moveTo(x + 0.5, y + 0.5);
		ctx.lineTo(x + w + 0.5, y + h + 0.5);
		ctx.closePath();
		ctx.stroke();
	};
	var arrow = function(ctx, x, y, s, d) {
		line(ctx, x, y, d * s, -s);
		line(ctx, x, y, d * s, s);
	};
	ctx.lineWidth = 1;
	ctx.strokeStyle = '#cccccc';
	var loc = location.split(/[:-]/);
	var chr = loc[0];
	var start = parseInt(loc[1]);
	var end = parseInt(loc[2]);
	var strand = parseInt(loc[3]);
	var len = end - start + 1;
	var size = parseInt('1' + new Array(len.toString().length + 1).join('0'));
	var sstr = size.toString().replace(/000$/, 'k').replace(/000k$/, 'M') + 'b';
	var img_start = (end + start - size) / 2;
	var bp_per_px = size * (12 / 10) / canvas.width;
	console.log(bp_per_px);
	var h = canvas.height;
	var step = size / 10 / bp_per_px;
	var step_start = (Math.floor(img_start / step) * step - img_start)
			/ bp_per_px;
	for (var i = 0; i < 12; i++) {
		offset = step_start + step * i;
		line(ctx, offset, 0, 0, h);
		if (!(i % 2)) {
			ctx.fillRect(offset, 0, step, 3);
		}
	}
	var gene_start = (start - img_start) / bp_per_px + canvas.width / 12;
	ctx.fillStyle = colour;
	ctx.fillRect(gene_start, 30, len / bp_per_px, 6);
	ctx.font = '10px sans-serif';
	if (strand > 0) {
		text = text + " >";
	} else {
		text = "< " + text;
	}
	ctx.fillText(text, gene_start, 25);
	ctx.fillText(location, step_start + step * 4 + 4, 45);
	ctx.strokeStyle = 'black';
	ctx.fillStyle = 'black';
	ctx.lineWidth = 1;
	line(ctx, 0, 0, canvas.width, 0);
	line(ctx, 0, 3, canvas.width, 0);
	line(ctx, step_start + step * 1, 10, step * 4, 0);
	line(ctx, step_start + step * 8, 10, step * 3, 0);
	arrow(ctx, step_start + step * 1, 10, 4, 1);
	arrow(ctx, step_start + step * 11, 10, 4, -1);
	ctx.fillText(sstr, step_start + step * 6, 15);
}

// draw_gene($('.rhs_canvas
// canvas')[0],"1:200000-290000:-1","SUMO4","#ff0000");

ensemblClientNamespace.draw = function() {
	$('.rhs_type').empty();
	$('.rhs_type').append('nononononnononononoo');

}

ensemblClientNamespace.getSpeciesName = function(species) {
	return ensemblClientNamespace.speciesList.get(species);
}

ensemblClientNamespace.loadSpecies = function() {
	ensemblClientNamespace.speciesList = new Map();
	ensemblClientNamespace.speciesList.set("saccharomyces_cerevisiae",
			"Saccharomyces cerevisiae");
	ensemblClientNamespace.speciesList.set("ciona_savignyi", "C.savignyi");
	ensemblClientNamespace.speciesList.set("myotis_lucifugus", "Microbat");
	ensemblClientNamespace.speciesList
			.set("taeniopygia_guttata", "Zebra Finch");
	ensemblClientNamespace.speciesList.set("sorex_araneus", "Shrew");
	ensemblClientNamespace.speciesList.set("otolemur_garnettii", "Bushbaby");
	ensemblClientNamespace.speciesList.set("erinaceus_europaeus", "Hedgehog");
	ensemblClientNamespace.speciesList.set("anolis_carolinensis",
			"Anole lizard");
	ensemblClientNamespace.speciesList.set("gadus_morhua", "Cod");
	ensemblClientNamespace.speciesList.set("dasypus_novemcinctus", "Armadillo");
	ensemblClientNamespace.speciesList.set("chlorocebus_sabaeus", "Vervet-AGM");
	ensemblClientNamespace.speciesList.set("tursiops_truncatus", "Dolphin");
	ensemblClientNamespace.speciesList.set("mus_musculus", "Mouse");
	ensemblClientNamespace.speciesList.set("bos_taurus", "Cow");
	ensemblClientNamespace.speciesList.set("mus_musculus_wsbeij",
			"Mouse WSB/EiJ");
	ensemblClientNamespace.speciesList.set("monodelphis_domestica", "Opossum");
	ensemblClientNamespace.speciesList.set("choloepus_hoffmanni", "Sloth");
	ensemblClientNamespace.speciesList.set("sus_scrofa", "Pig");
	ensemblClientNamespace.speciesList.set("rattus_norvegicus", "Rat");
	ensemblClientNamespace.speciesList.set("caenorhabditis_elegans",
			"Caenorhabditis elegans");
	ensemblClientNamespace.speciesList.set("pteropus_vampyrus", "Megabat");
	ensemblClientNamespace.speciesList.set("microcebus_murinus", "Mouse Lemur");
	ensemblClientNamespace.speciesList.set("sarcophilus_harrisii",
			"Tasmanian devil");
	ensemblClientNamespace.speciesList.set("ovis_aries", "Sheep");
	ensemblClientNamespace.speciesList.set("carlito_syrichta", "Tarsier");
	ensemblClientNamespace.speciesList.set("papio_anubis", "Olive baboon");
	ensemblClientNamespace.speciesList.set("mus_musculus_akrj", "Mouse AKR/J");
	ensemblClientNamespace.speciesList.set("pelodiscus_sinensis",
			"Chinese softshell turtle");
	ensemblClientNamespace.speciesList.set("equus_caballus", "Horse");
	ensemblClientNamespace.speciesList
			.set("xiphophorus_maculatus", "Platyfish");
	ensemblClientNamespace.speciesList.set("macaca_mulatta", "Macaque");
	ensemblClientNamespace.speciesList.set("mus_musculus_balbcj",
			"Mouse BALB/cJ");
	ensemblClientNamespace.speciesList
			.set("mus_musculus_dba2j", "Mouse DBA/2J");
	ensemblClientNamespace.speciesList.set("astyanax_mexicanus", "Cave fish");
	ensemblClientNamespace.speciesList.set("latimeria_chalumnae", "Coelacanth");
	ensemblClientNamespace.speciesList.set("mus_musculus_nodshiltj",
			"Mouse NOD/ShiLtJ");
	ensemblClientNamespace.speciesList.set("mus_musculus_aj", "Mouse A/J");
	ensemblClientNamespace.speciesList.set("ficedula_albicollis", "Flycatcher");
	ensemblClientNamespace.speciesList.set("gasterosteus_aculeatus",
			"Stickleback");
	ensemblClientNamespace.speciesList.set("oryctolagus_cuniculus", "Rabbit");
	ensemblClientNamespace.speciesList.set("gorilla_gorilla", "Gorilla");
	ensemblClientNamespace.speciesList.set("oreochromis_niloticus", "Tilapia");
	ensemblClientNamespace.speciesList.set("echinops_telfairi",
			"Lesser hedgehog tenrec");
	ensemblClientNamespace.speciesList.set("nomascus_leucogenys", "Gibbon");
	ensemblClientNamespace.speciesList.set("homo_sapiens", "Human");
	ensemblClientNamespace.speciesList.set("dipodomys_ordii", "Kangaroo rat");
	ensemblClientNamespace.speciesList.set("mus_musculus_casteij",
			"Mouse CAST/EiJ");
	ensemblClientNamespace.speciesList.set("lepisosteus_oculatus",
			"Spotted gar");
	ensemblClientNamespace.speciesList.set("anas_platyrhynchos", "Duck");
	ensemblClientNamespace.speciesList.set("canis_familiaris", "Dog");
	ensemblClientNamespace.speciesList.set("callithrix_jacchus", "Marmoset");
	ensemblClientNamespace.speciesList.set("pongo_abelii", "Orangutan");
	ensemblClientNamespace.speciesList.set("ornithorhynchus_anatinus",
			"Platypus");
	ensemblClientNamespace.speciesList.set("tetraodon_nigroviridis",
			"Tetraodon");
	ensemblClientNamespace.speciesList.set("mustela_putorius_furo", "Ferret");
	ensemblClientNamespace.speciesList.set("mus_musculus_c57bl6nj",
			"Mouse C57BL/6NJ");
	ensemblClientNamespace.speciesList.set("vicugna_pacos", "Alpaca");
	ensemblClientNamespace.speciesList.set("meleagris_gallopavo", "Turkey");
	ensemblClientNamespace.speciesList.set("xenopus_tropicalis", "Xenopus");
	ensemblClientNamespace.speciesList
			.set("mus_musculus_fvbnj", "Mouse FVB/NJ");
	ensemblClientNamespace.speciesList.set("mus_musculus_pwkphj",
			"Mouse PWK/PhJ");
	ensemblClientNamespace.speciesList.set("ictidomys_tridecemlineatus",
			"Squirrel");
	ensemblClientNamespace.speciesList.set("mus_musculus_nzohlltj",
			"Mouse NZO/HlLtJ");
	ensemblClientNamespace.speciesList.set("mus_musculus_129s1svimj",
			"Mouse 129S1/SvImJ");
	ensemblClientNamespace.speciesList.set("mus_musculus_cbaj", "Mouse CBA/J");
	ensemblClientNamespace.speciesList.set("cavia_porcellus", "Guinea Pig");
	ensemblClientNamespace.speciesList.set("takifugu_rubripes", "Fugu");
	ensemblClientNamespace.speciesList.set("ochotona_princeps", "Pika");
	ensemblClientNamespace.speciesList.set("pan_troglodytes", "Chimpanzee");
	ensemblClientNamespace.speciesList.set("petromyzon_marinus", "Lamprey");
	ensemblClientNamespace.speciesList.set("ailuropoda_melanoleuca", "Panda");
	ensemblClientNamespace.speciesList.set("mus_spretus_spreteij",
			"Mouse SPRET/EiJ");
	ensemblClientNamespace.speciesList.set("felis_catus", "Cat");
	ensemblClientNamespace.speciesList.set("mus_musculus_c3hhej",
			"Mouse C3H/HeJ");
	ensemblClientNamespace.speciesList.set("procavia_capensis", "Hyrax");
	ensemblClientNamespace.speciesList.set("oryzias_latipes", "Medaka");
	ensemblClientNamespace.speciesList.set("danio_rerio", "Zebrafish");
	ensemblClientNamespace.speciesList.set("gallus_gallus", "Chicken");
	ensemblClientNamespace.speciesList.set("tupaia_belangeri", "Tree Shrew");
	ensemblClientNamespace.speciesList.set("mus_musculus_lpj", "Mouse LP/J");
	ensemblClientNamespace.speciesList.set("ciona_intestinalis",
			"C.intestinalis");
	ensemblClientNamespace.speciesList.set("loxodonta_africana", "Elephant");
	ensemblClientNamespace.speciesList.set("poecilia_formosa", "Amazon molly");
	ensemblClientNamespace.speciesList.set("drosophila_melanogaster",
			"Fruitfly");
	ensemblClientNamespace.speciesList.set("notamacropus_eugenii", "Wallaby");
}

$(function() {
	ensemblClientNamespace.loadSpecies();
	
	$('.maybe_wrap').each(
			function() {
				var $el = $(this);
				$el.css('overflow', 'hidden');
				if (this.clientHeight != this.scrollHeight
						|| this.clientWidth != this.scrollWidth) {
					$el.addClass('was_wrapped');
				}
			});

});