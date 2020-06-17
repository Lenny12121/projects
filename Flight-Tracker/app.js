$(()=> {

    //Instead of creating my own list/array of airport codes & cities I implemented autocomplete package for airport code & city from https://www.npmjs.com/package/airport-autocomplete-js

    AirportInput("departure");
    AirportInput("arrival");

    // This takes the input from above and finds the ICAO code Equivalent for departure airport.

    const getAirportDeparture = () => {
        let IATAcode = $('#departure').val();
        $.ajax({
          url: "https://greatcirclemapper.p.rapidapi.com/airports/search/" + IATAcode,
          method: "GET",
          dataType: 'json',
          "headers": {
            "x-rapidapi-host": "greatcirclemapper.p.rapidapi.com",
            "x-rapidapi-key": "127954c385msh671084fd9c934cap1652ccjsn0d18428954de"
        }
        }).then((airport) => {
            $('.container').html(`
            <h2> ${airport[0].name} </h2>
            <h2> ${airport[0].ident} </h2>
            `)
            console.log(airport[0].name)
            console.log(airport[0].ident)
            console.log(airport)
        }, (error) => {
          console.error(error);
        })
    }



    // getCity();


})