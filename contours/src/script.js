var data,
    margin = { top: 20, right: 20, bottom: 30, left: 30},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    color = d3.scale.category10(),
    titles = [],
    allMelodies = [],
    selected = [];

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

//doing this as separate pages for now
/*
var updateData = function() {
    var selectedValue = d3.event.target.value;
    alert("Switching to display by " + selectedValue)
    $("svg").remove();
    if (selectedValue == "number") {chartPitches("number")}
    else if (selectedValue == "name") {chartPitches("name")}
    else if (selectedValue == "location") {chartPitches("location")}
    else if (selectedValue == "year") {chartPitches("year")}
    else {alert("OH NO")}
}
*/

var pitchLabels = {
    0: "G3",
    1: "Ab3",
    2: "A3",
    3: "Bb3",
    4: "B3",
    5: "C4",
    6: "Db4",
    7: "D4",
    8: "Eb4",
    9: "E4",
    10: "F4",
    11: "Gb4",
    12: "G4",
    13: "Ab4",
    14: "A4",
    15: "Bb4",
    16: "B4",
    17: "C5",
    18: "Db5",
    19: "D5",
    20: "Eb5",
    21: "E5",
    22: "F5",
    23: "Gb5",
    24: "G5",
    25: "Ab5",
    26: "A5",
};

var formatPitch = function(d) {
    return pitchLabels[d]; }

var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .tickFormat(function(d) {
        return d + '%'; })

var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .tickValues(function() {
        var keys = Object.keys(pitchLabels);
        values = [];
        keys.map(function(pitch) {
            values.push(pitch, String(pitch * 2));
        });
        return values;
    })
    .tickFormat(formatPitch)

var line = d3.svg.line()
    .interpolate('basis')
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.y); })

var chart = d3.select('.chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('class', 'container')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// change CSS based on selected array
var displaySelected = function() {
    if (selected.length === 0) {
        $('.melody').each(function(index) {
            $(this).css('opacity', '');
            $(this).find('.line').css('opacity', '');
        })
    } else {
        $('.melody').each(function(index) {
            var melodyID = $(this).attr('id');
            if (selected.indexOf(melodyID) !== -1) {
                $(this).css('opacity','1')		
            } else {
                $(this).css('opacity', '0.07')
            }
        });	
    }
};

//event listeners
var setListeners = function() {
    //listener for button clicks
    $('.selector').click(function(e) {
        e.preventDefault();
        var id = e.target.id;
	var location = e.target.test;
        var index = selected.indexOf(id)
	if (index === -1) {
            selected.push(id);
        } else {
            selected.splice(index, 1)
        }
        displaySelected();
    });

    //dropdown new selection listener - doing this as separate pages for now
    //d3.select("#dropdown").on("change", updateData) 
}

//draw buttons
var createButtons = function(data) {
    var buttons = $('#buttons');
    buttons.addClass('btn-group')
        .attr('data-toggle', 'buttons');

    // create the melody buttons
    allMelodies.map(function(melody) {
	var button = $('<label></label>')
	   .attr('id', melody)
	   .addClass('btn btn-xs btn-default selector')
	   .text(melody)
	var buttonInput = $('<input />')
	   .attr('type', 'checkbox')
	   .attr('autocomplete', 'off')
	button.append(buttonInput)
	buttons.append(button);
    });

    setListeners();
}

var setColors = function(data) {
    data.map(function(m) {
        allMelodies.push(m.title)
        var domain = m.title;
        if (titles.indexOf(domain) === -1) { titles.push(domain) }
    })
    var color = d3.scale.category10()
        .domain(titles);
}

var offsetToPercent = function(data) {
    data.map(function(m) {
        var pieceLength = m.notes[m.notes.length - 1].duration + m.notes[m.notes.length - 1].offset;
        m.notes.map(function(n) {
            n.offset = n.offset / pieceLength * 100;
            n.duration = n.duration / pieceLength * 100;
        });
    });
    return data;
}

var createFinalPitch = function(m) {
    // find the last non-rest in a melody
    // create a pitch that extends to the end of the piece's full duration
    var lastNote = {
        'duration': m.notes[m.notes.length - 1].duration,
        'offset': m.notes[m.notes.length - 1].duration + m.notes[m.notes.length - 1].offset,
        'pitchNum': m.notes[m.notes.length - 1].pitchNum
    }
    if (lastNote.pitch === 'rest') {
        var i = m.notes.length - 1;
        while (m.notes[i].pitch === 'rest') {
            i -= 1;
        }
        lastNote.pitch = m.notes[i].pitch;
    }
    return lastNote;
}

var formatData = function(data, mode) {
    data = offsetToPercent(data);
    shortestDuration = d3.min(data, function(d) {
        return (d3.min(d.notes, function(d) { return d.duration }))
    })
    withEndPoints = [];
    var numNotes = 0;
    data.map(function(m) {
        var melody = {};
	//set melody.title
	if (mode == "number") {melody.title = m.number; }
	else if (mode == "name") {melody.title = m.title; }
	else if (mode == "location") {melody.title = m.location; }
	else if (mode == "year") {melody.title = m.year; }
	//set other melody features
	melody.name = m.title;
	melody.location = m.location;
	melody.year = m.year;
	melody.number = m.number;
        melody.notes = [];
        m.notes.map(function(n, i) {
            numNotes += 1;
            // skip initial rests
            if (n.pitch !== 'rest') {
                melody.notes.push(n);
                endPoint = {
                    'duration': 0,
                    'offset': n.offset + n.duration,
                    'frequency': n.frequency,
		    'pitch': n.pitch,
		    'pitchNum' : n.pitchNum
                }
                melody.notes.push(endPoint);
            }
        })
        melody.notes.push(createFinalPitch(m));
        withEndPoints.push(melody)
//	console.log(melody)
    });
//    console.log(data)
    return withEndPoints;
}

var chartPitches = function(mode) {
    d3.json('collection_data.json', function(error, data) {
        if (error) {return console.warn(error);}
	
	if (mode === "number") {data = formatData(data,"number");}
	else if (mode === "name") {data = formatData(data,"name");}
	else if (mode === "location") {data = formatData(data,"location");}
	else if (mode === "year") {data = formatData(data,"year");}

	setColors(data);

        x.domain([0, (d3.max(data, function(d) {
            return (d3.max(d.notes, function(d) { return d.offset }))
        }))]);
	y.domain([0, (d3.max(data, function(d) {
	    return (d3.max(d.notes, function(d) { return d.pitchNum }))
	}))]);

        // add axes, title
        chart.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)
          .append('text')
            .attr('x', width - 10)
            .attr('y', -6)
            .attr('dx', '.71em')
            .style('text-anchor', 'end')
            .text("Melody's Duration, normalized to 100%")

        chart.append('g')
            .attr('class', 'axis axis--y')
            .call(yAxis)
          .append('text')
            .attr('id', 'yAxis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('Pitch');

        var titleText = data.length > 1 ? " Peggy Variants" : " Melodic Contour"
        chart.append('g')
            .attr('class', 'title')
          .append('text')
            .attr('y', 20)
            .attr('x', width / 2)
            .style('text-anchor', 'middle')
            .text(function() {
                return data.length + titleText;
            });

        // visualize data
        var melody = chart.selectAll('.melody')
            .data(data)
          .enter().append('g')
            .attr('class', 'melody')
            .attr('id', function(d) {
                return d.title;
            })

        melody.append('path')
            .attr('class', 'line')
            .attr('d', function(d) {
                var values = d.notes.map(function(note, index) {
                    return { x: note.offset, y: note.pitchNum }
                });
                return line(values);
            })
            .attr('id', function(d, i) { return 'path-' + i; })
            .style('stroke', function(d) { return color(d.title) })

        melody.append('text')
            .attr('dy', -5)
          .append('textPath')
            .attr('class', 'textpath')
            .attr('startOffset', function(d) {
                var numMelodies = data.length;
                var thisMelodyIndex = titles.indexOf(d.title) * 1.0
                return String(thisMelodyIndex / numMelodies * 100.0) + '%';
            })
            .attr('xlink:href', function(d, i) { return '#path-' + i; })
            .text(function(d) { return d.title })

        createButtons(data);

    })
}
