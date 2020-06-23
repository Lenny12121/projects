$(() => {

    //Instead of creating my own list/array of airport codes & cities I implemented this autocomplete package for airport code & city from https://www.npmjs.com/package/airport-autocomplete-js

    const options = {
        formatting: `<div class="$(unique-result)" single-result" data-index="$(i)"> $(IATA)</div>`
        // fuse_options: {
        //     shouldSort: true,
        //     threshold: 0.4,
        //     maxPatternLength: 32,
        //     keys: [{
        //         name: "IATA",
        //         weight: 1
        //       },
        //       {
        //         name: "name",
        //         weight: 0
        //       },
        //       {
        //         name: "city",
        //         weight: 0
        //       }
        //     ]
        //   }
    };

    AirportInput("departure", options);
    AirportInput("arrival", options);

    let IATAcodeDeparture = '';
    let IATAcodeArrival = '';

    // This takes the input from above and finds the ICAO code Equivalent for departure airport.

    const getAirportDeparture = () => {
        let IATAcode = $('#departure').val();
        $.ajax({
            url: "https://greatcirclemapper.p.rapidapi.com/airports/search/" + IATAcode.substring(0, 3),
            method: "GET",
            dataType: 'json',
            "headers": {
                "x-rapidapi-host": "greatcirclemapper.p.rapidapi.com",
                "x-rapidapi-key": "127954c385msh671084fd9c934cap1652ccjsn0d18428954de"
            }
        }).then((airport) => {
            let departure = airport[0].ident
            IATAcodeDeparture = departure;
            getAirportArrival();
        }, (error) => {
            console.error(error);
        })
    }

    // This takes the input from above and finds the ICAO code Equivalent for arrival airport.

    const getAirportArrival = () => {
        let IATAcode = $('#arrival').val();
        $.ajax({
            url: "https://greatcirclemapper.p.rapidapi.com/airports/search/" + IATAcode.substring(0, 3),
            method: "GET",
            dataType: 'json',
            "headers": {
                "x-rapidapi-host": "greatcirclemapper.p.rapidapi.com",
                "x-rapidapi-key": "127954c385msh671084fd9c934cap1652ccjsn0d18428954de"
            }
        }).then((airport) => {
            let arrival = airport[0].ident
            IATAcodeArrival = arrival;
            calculateCO2();
        }, (error) => {
            console.error(error);
        })
    }


    // Most used aircrafts are A320neo for short-haul & A350 for long-haul
    //source: https://www.oliverwyman.com/content/dam/oliver-wyman/v2/publications/2019/January/global-fleet-mro-market-forecast-commentary-2019-2029.pdf

    //The A350 uses around  8.9kg/km, 
    // source: https://theicct.org/sites/default/files/publications/Transatlantic_Fuel_Efficiency_Ranking_20180912.pdf

    //The A320neo uses around 2.3kg/km
    //Source: https://books.google.at/books?id=Z5W0DwAAQBAJ&pg=PT164&lpg=PT164&dq=fuel+burn+a320neo&source=bl&ots=xyOeoeVCPW&sig=ACfU3U0jV3OhBfBm63UsdV4oz5nV8K9Y1A&hl=en&sa=X&ved=2ahUKEwifjoml-orqAhUXHHcKHbQbCPk4ChDoATABegQIChAB#v=onepage&q=fuel%20burn%20a320neo&f=false

    // 1kg of fuel produces an average of 3.15kg of CO2
    //source: https://www.iata.org/contentassets/922ebc4cbcd24c4d9fd55933e7070947/icop20faq20general20for20airline20participants20jan202016.pdf

    //Passenger to cargo factor taken average from ICAO which is 0.85
    //Source: https://www.icao.int/environmental-protection/CarbonOffset/Documents/Methodology%20ICAO%20Carbon%20Calculator_v10-2017.pdf

    // A350 has about 380 seats in 3 class layout
    //source: https://www.airbus.com/aircraft/passenger-aircraft/a350xwb-family/a350-1000.html

    // A320neo has average of 155 seats in 2 class layout
    // https://www.airbus.com/aircraft/passenger-aircraft/a320-family/a320neo.html


    //Passenger load of average 0.8
    //Source: https://www.icao.int/environmental-protection/CarbonOffset/Documents/Methodology%20ICAO%20Carbon%20Calculator_v10-2017.pdf

    // Load factor by class is around Economy (0.8), Business (0.6), First (0.4)
    //Source: http://documents.worldbank.org/curated/en/141851468168853188/pdf/WPS6471.pdf

    //  Footprints by Travel Class, Relative to the Footprint of an Average Passenger, assuming Load Factors of 0.40 for First Class, 0.60 for Business Class,and 0.80 for Economy Class is:
    // Economy (0.82), Business (2.07), First (4.79)
    //Source (pg 15): http://documents.worldbank.org/curated/en/141851468168853188/pdf/WPS6471.pdf

    // Radiative forcing index of 2.7 to account for additional negative externalities of flight such as the release of NOx & sulphure which causes o3 and a degradation of CH4 in the atmosphere
    //Source: http://documents.worldbank.org/curated/en/141851468168853188/pdf/WPS6471.pdf

    // To calculate the emissions of 1 individual person on the flight we must take the: 
    // (distance * fuel consumption * emissions/kg * passenger to cargo ratio * RFI * footprint by cabin class) / (number of seats on the plane * plane load factor)
    // A350 base:
    // (distance * 8.9 * * 3.15 * 0.85 * 2.7 * footprint by cabin class) / (380 * 0.8)
    // A320neo base:
    // (distance * 2.3 * 3.15 * 0.85 * 2.7 * footprint by cabin class) / (155 *  0.8)

    // We classify short haul flights as  less than 3000km and long haul as more than 3000km

    //The function calculateDistance takes the above values and calculates distance. It then also  corrects the distance measurement taken from Great Circle Mapper as described in the ICAO methodology (https://www.icao.int/environmental-protection/CarbonOffset/Documents/Methodology%20ICAO%20Carbon%20Calculator_v10-2017.pdf). Average commercial aircraft speed is about 510 kts.

    // We are charging $4.20 per tonne

    const calculateCO2 = () => {
        // First take the Cabin Class entered by the user and save it for later
        let cabinClass = $('.inputBody').val();
        let tripChoice = $('.inputBody1').val();
        $.ajax({
            url: "https://greatcirclemapper.p.rapidapi.com/airports/route/" + IATAcodeDeparture + "-" + IATAcodeArrival + "/510",
            method: "GET",
            dataType: 'json',
            "headers": {
                "x-rapidapi-host": "greatcirclemapper.p.rapidapi.com",
                "x-rapidapi-key": "127954c385msh671084fd9c934cap1652ccjsn0d18428954de"
            }
        }).then((route) => {
            let distance = route.totals.distance_km
            console.log('distance before: ', distance);
            if (distance <= 550) {
                distance = distance + 50;
            } else if (distance > 550 && distance <= 5500) {
                distance = distance + 100;
            } else {
                distance = distance + 125;
            }

            // After calculating & adjusting the distance we must determine if it is longhaul or short haul and find the co2 emission for the passenger on this flight using the formula we created in the notes above

            let co2Emissions = 0
            if (cabinClass == 'Economy' && distance < 3000 && tripChoice == 'No') {
                co2Emissions = ((distance * 2.3 * 3.15 * 0.85 * 2.7 * 0.82) / (155 * 0.8)) / 1000;
                co2Emissions = Math.ceil(co2Emissions);
            } else if (cabinClass == 'Premium Economy' && distance < 3000 && tripChoice == 'No') {
                co2Emissions = ((distance * 2.3 * 3.15 * 0.85 * 2.7 * 0.82) / (155 * 0.8)) / 1000;
                co2Emissions = Math.ceil(co2Emissions);
            } else if (cabinClass == 'Business' && distance < 3000 && tripChoice == 'No') {
                co2Emissions = ((distance * 2.3 * 3.15 * 0.85 * 2.7 * 2.07) / (155 * 0.8)) / 1000;
                co2Emissions = Math.ceil(co2Emissions);
            } else if (cabinClass == 'First Class' && distance < 3000 && tripChoice == 'No') {
                co2Emissions = ((distance * 2.3 * 3.15 * 0.85 * 2.7 * 4.79) / (155 * 0.8)) / 1000;
                co2Emissions = Math.ceil(co2Emissions);
            } else if (cabinClass == 'Economy' && distance >= 3000 && tripChoice == 'No') {
                co2Emissions = ((distance * 8.9 * 3.15 * 0.85 * 2.7 * 0.82) / (380 * 0.8)) / 1000;
                co2Emissions = Math.ceil(co2Emissions);
            } else if (cabinClass == 'Premium Economy' && distance >= 3000 && tripChoice == 'No') {
                co2Emissions = ((distance * 8.9 * 3.15 * 0.85 * 2.7 * 0.82) / (380 * 0.8)) / 1000;
                co2Emissions = Math.ceil(co2Emissions);
            } else if (cabinClass == 'Business' && distance >= 3000 && tripChoice == 'No') {
                co2Emissions = ((distance * 8.9 * 3.15 * 0.85 * 2.7 * 2.07) / (380 * 0.8)) / 1000;
                co2Emissions = Math.ceil(co2Emissions);
            } else if (cabinClass == 'First Class' && distance >= 3000 && tripChoice == 'No') {
                co2Emissions = ((distance * 8.9 * 3.15 * 0.85 * 2.7 * 4.79) / (380 * 0.8)) / 1000;
                co2Emissions = Math.ceil(co2Emissions);
            } else if (cabinClass == 'Economy' && distance < 3000 && tripChoice == 'Yes') {
                co2Emissions = (((distance * 2.3 * 3.15 * 0.85 * 2.7 * 0.82) / (155 * 0.8)) / 1000) * 2;
                co2Emissions = Math.ceil(co2Emissions);
            } else if (cabinClass == 'Premium Economy' && distance < 3000 && tripChoice == 'Yes') {
                co2Emissions = (((distance * 2.3 * 3.15 * 0.85 * 2.7 * 0.82) / (155 * 0.8)) / 1000) * 2;
                co2Emissions = Math.ceil(co2Emissions);
            } else if (cabinClass == 'Business' && distance < 3000 && tripChoice == 'Yes') {
                co2Emissions = (((distance * 2.3 * 3.15 * 0.85 * 2.7 * 2.07) / (155 * 0.8)) / 1000) * 2;
                co2Emissions = Math.ceil(co2Emissions);
            } else if (cabinClass == 'First Class' && distance < 3000 && tripChoice == 'Yes') {
                co2Emissions = (((distance * 2.3 * 3.15 * 0.85 * 2.7 * 4.79) / (155 * 0.8)) / 1000) * 2;
                co2Emissions = Math.ceil(co2Emissions);
            } else if (cabinClass == 'Economy' && distance >= 3000 && tripChoice == 'Yes') {
                co2Emissions = (((distance * 8.9 * 3.15 * 0.85 * 2.7 * 0.82) / (380 * 0.8)) / 1000) * 2;
                co2Emissions = Math.ceil(co2Emissions);
            } else if (cabinClass == 'Premium Economy' && distance >= 3000 && tripChoice == 'Yes') {
                co2Emissions = (((distance * 8.9 * 3.15 * 0.85 * 2.7 * 0.82) / (380 * 0.8)) / 1000) * 2;
                co2Emissions = Math.ceil(co2Emissions);
            } else if (cabinClass == 'Business' && distance >= 3000 && tripChoice == 'Yes') {
                co2Emissions = (((distance * 8.9 * 3.15 * 0.85 * 2.7 * 2.07) / (380 * 0.8)) / 1000) * 2;
                co2Emissions = Math.ceil(co2Emissions);
            } else if (cabinClass == 'First Class' && distance >= 3000 && tripChoice == 'Yes') {
                co2Emissions = (((distance * 8.9 * 3.15 * 0.85 * 2.7 * 4.79) / (380 * 0.8)) / 1000) * 2;
                co2Emissions = Math.ceil(co2Emissions);
            } else {
                console.log('error. Fool!')
            }

            let IATAcodeDeparture = $('#departure').val().substring(0, 3);
            let IATAcodeArrival = $('#arrival').val().substring(0, 3);
            let price = co2Emissions * 4.20;

            let flightDiv =
                `<div class="loggedFlight"><div id="flight"> <div id="image"> <img id="planeGif" src="./Assets/airplane.gif" alt="Offset Flight"> </div> <div> <div id="flightText"> <h2 id="flightRoute"> ${IATAcodeDeparture} - ${IATAcodeArrival} </h2> <h3 id="CO2amount">${co2Emissions} tonnes of CO2</h3></div> </div> <div class="closeImage"><img id="close" src="./Assets/Untitled-1.png" alt="Close"></div> </div> <button id="offset-flight">Offset ($${price})</button> </div>`

            $('.noFlights').empty();

            //NEED TO ADD STRIPE LISTENER HERE I THINK

            // $('#offset-flight').on('click', (event) =>  {
                
            // })

            $('.flightBox').append(flightDiv);

            $('.flightBox').css('display', 'flex').css('flex-direction', 'row').css('flex-wrap', 'wrap');

            cache();

        }, (error) => {
            console.error(error);
        })
    }

    let cache = () =>   {
        let string = $('.container').html();
        localStorage.setItem('flightLog', string);
    };

    if (localStorage.getItem('flightLog')) {
        $('.container').html(localStorage.getItem('flightLog'));
    } 

    $(document).on('click', '.closeImage', function () {
        $(this).parent().parent().remove();
            // if ($('.flightBox').contents()) {
            //     console.log('FLightbox is empty')
            //     $('.noFlights').text(`You have  not logged any flights yet. Use the form above to get started.`);
            // }
        cache();
    })

    //Attempt at stripe payment for each tile. Need to load stripe js externally as done on live site. THIS WILL NOT WORK IN DEMO 

    // $(document).on('click', '#offset-flight', function () {
    //     let sd=$(this).text();
    //     let num = sd.match(/[\d\.]+/g);
    //         if (num != null){
    //         let number = num.toString();
    //         alert(number );
    //         }
    //     let quantityTotal = number / 0.42
    //     stripe.redirectToCheckout({
    //         billingAddressCollection: 'required',
    //         lineItems: [{price: 'price_1GxDKVHinkcuNuApKvVyzAMv', quantity: quantityTotal}],
    //         mode: 'payment',
    //         // Do not rely on the redirect to the successUrl for fulfilling
    //         // purchases, customers may not always reach the success_url after
    //         // a successful payment.
    //         // Instead use one of the strategies described in
    //         // https://stripe.com/docs/payments/checkout/fulfillment
    //         successUrl: 'http://www.getmads.com/success',
    //         cancelUrl: 'http://www.getmads.com/canceled',
    //       })
    //       .then(function (result) {
    //         if (result.error) {
    //           // If `redirectToCheckout` fails due to a browser or network
    //           // error, display the localized error message to your customer.
    //           var displayError = document.getElementById('error-message');
    //           displayError.textContent = result.error.message;
    //         }
    //       });
    //     });


    $('#save-flight').on('click', (event) => {
        event.preventDefault()
        getAirportDeparture();
        console.log(IATAcodeDeparture);
        console.log(IATAcodeArrival);
    });

    // Custom dropdown menu taken and modified from here: https://jsfiddle.net/BB3JK/47/

    $('select').each(function () {

        var $this = $(this),
            numberOfOptions = $(this).children('option').length;

        $this.addClass('s-hidden');

        $this.wrap('<div class="select"></div>');

        $this.after('<div class="styledSelect"></div>');

        var $styledSelect = $this.next('div.styledSelect');

        $styledSelect.text($this.children('option').eq(0).text());

        var $list = $('<ul />', {
            'class': 'options'
        }).insertAfter($styledSelect);

        for (var i = 0; i < numberOfOptions; i++) {
            $('<li />', {
                text: $this.children('option').eq(i).text(),
                rel: $this.children('option').eq(i).val()
            }).appendTo($list);
        }

        var $listItems = $list.children('li');

        $styledSelect.click(function (e) {
            e.stopPropagation();
            $('div.styledSelect.active').each(function () {
                $(this).removeClass('active').next('ul.options').hide();
            });
            $(this).toggleClass('active').next('ul.options').toggle();
        });

        $listItems.click(function (e) {
            e.stopPropagation();
            $styledSelect.text($(this).text()).removeClass('active');
            $this.val($(this).attr('rel'));
            $list.hide();
        });

        $(document).click(function () {
            $styledSelect.removeClass('active');
            $list.hide();
        });

    });

    //Accordion implemented using jQuery UI and elements for styling from here: https://www.hongkiat.com/blog/theming-jquery-ui-accordion/

    $("#accordion").accordion({
        collapsible: true,
        heightStyle: "fill"
    });


})


<script src="https://uploads-ssl.webflow.com/5e464cacf1271f4715131371/5ef04f8770215e4c2fc639d0_Webflow-JS-Accordion-FlightTracker.txt"></script>
<script></script>

//with stripe
<script src="https://uploads-ssl.webflow.com/5e464cacf1271f4715131371/5ef21f2ad4187730e7207285_Webflow-JS-Accordion-FlightTracker%20STRIPE.txt"></script>
<script></script>
