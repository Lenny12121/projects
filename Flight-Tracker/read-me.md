## Description:

After extensive research into flight offsetting this tool was built in order to simplify it's implementation. It details the methodology of CO2 calculation and automatically calculates the corresponding price in dollars.

1. [Git demo](https://lenny12121.github.io/projects/Flight-Tracker/)

2. [Live](https://www.getmads.com/flight-tracker)

## Technologies used:
1. Instead of creating my own list/array of airport codes & cities I implemented this autocomplete package for airport code & city which uses Fuse.js (https://www.npmjs.com/package/airport-autocomplete-js)

2. The Great Circle Mapper API is used to calculate the distance between airports (https://rapidapi.com/marcusgoede/api/great-circle-mapper)

3. Everything else is written in HTML, Pure CSS, JavaScript, jQuery (including jQuery UI).

4. On the live version Stripe has been integrated to allow for payments.

## Still unsolved:
1. Appending placeholder text into the "Your Flights" section of the site

2. Allowing multiple tickets to be offset in one go.

3. Allowing to offset all flights in one go.