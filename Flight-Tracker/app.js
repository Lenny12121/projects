$(()=> {

    //Instead of creating my own list/array of airport codes & cities I implemented autocomplete package for airport code & city from https://www.npmjs.com/package/airport-autocomplete-js

    AirportInput("departure");
    AirportInput("arrival");

    let IATAcodeDeparture = '';
    let IATAcodeArrival = '';

    // This takes the input from above and finds the ICAO code Equivalent for departure airport.

    const getAirportDeparture = () => {
        let IATAcode = $('#departure').val();
        $.ajax({
          url: "https://greatcirclemapper.p.rapidapi.com/airports/search/" + IATAcode.substring(0,3),
          method: "GET",
          dataType: 'json',
          "headers": {
            "x-rapidapi-host": "greatcirclemapper.p.rapidapi.com",
            "x-rapidapi-key": "127954c385msh671084fd9c934cap1652ccjsn0d18428954de"
        }
        }).then((airport) => {
            // $('.container').html(`
            // <h2> ${airport[0].name} </h2>
            // <h2> ${airport[0].ident} </h2>
            // `)
            // console.log(airport[0].name)
            // console.log(airport[0].ident)
            // console.log(airport)
            // IATAcodeDeparture.push(airport[0].ident);
            let departure = airport[0].ident
            IATAcodeDeparture = departure;
            console.log('departure: ' , IATAcodeDeparture)
            getAirportArrival();
            // return airport[0].ident
        }, (error) => {
          console.error(error);
        })
    }

    // This takes the input from above and finds the ICAO code Equivalent for arrival airport.

    const getAirportArrival = () => {
        let IATAcode = $('#arrival').val();
        $.ajax({
          url: "https://greatcirclemapper.p.rapidapi.com/airports/search/" + IATAcode.substring(0,3),
          method: "GET",
          dataType: 'json',
          "headers": {
            "x-rapidapi-host": "greatcirclemapper.p.rapidapi.com",
            "x-rapidapi-key": "127954c385msh671084fd9c934cap1652ccjsn0d18428954de"
        }
        }).then((airport) => {
            // $('.container').html(`
            // <h2> ${airport[0].name} </h2>
            // <h2> ${airport[0].ident} </h2>
            // `)
            // console.log(airport[0].name)
            // console.log(airport[0].ident)
            // console.log(airport)
            // IATAcodeArrival.push(airport[0].ident);
            let arrival = airport[0].ident
            IATAcodeArrival = arrival;
            calculateDistance();
            // console.log(IATAcodeArrival);
            // return airport[0].ident
        }, (error) => {
          console.error(error);
        })
    }

    //This takes the above values and calculates distance. Still need to find average for speed based on aircraft type (maybe pick most common for ease).

    const calculateDistance = () => {
        console.log(IATAcodeDeparture)
        console.log(IATAcodeArrival);
        // let departure = $(IATAcodeDeparture).eq(0);
        // let arrival = $(IATAcodeArrival).eq(0);
        // console.log(departure);
        $.ajax({
          url: "https://greatcirclemapper.p.rapidapi.com/airports/route/" + IATAcodeDeparture + "-" + IATAcodeArrival + "/510",
          method: "GET",
          dataType: 'json',
          "headers": {
            "x-rapidapi-host": "greatcirclemapper.p.rapidapi.com",
            "x-rapidapi-key": "127954c385msh671084fd9c934cap1652ccjsn0d18428954de"
        }
        }).then((route) => {
            // $('.container').html(`
            // <h2> ${route.totals.distance_km} </h2>
            // `)
            console.log(route.totals.distance_km)
            console.log(route)
            // return route.totals.distance_km
        }, (error) => {
          console.error(error);
        })
    }

    // let departure1 = $(IATAcodeDeparture).eq(0);
    // let arrival1 = $(IATAcodeArrival).eq(0);
    // let departure = IATAcodeDeparture[0];
    // let arrival = IATAcodeArrival[0];

$('#save-flight').on('click', (event) => {
    event.preventDefault()
    getAirportDeparture();
    // getAirportArrival();
    // calculateDistance();
    console.log(IATAcodeDeparture);
    console.log(IATAcodeArrival);
    // console.log(departure);
    // console.log(arrival);
    // console.log(departure1);
    // console.log(arrival1);
});



})