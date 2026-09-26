NAJAF DELIVERY REAL FEATURES UPDATE

This update adds:
- Real JWT login/register against the existing Express/MongoDB backend.
- Browser GPS permission using navigator.geolocation.
- One-click current-location fetch and reverse geocoding.
- Leaflet + OpenStreetMap map for selecting/displaying the delivery point.
- Coordinates stored in the order address.
- Real Socket.IO customer tracking.
- Real delivery-partner GPS sharing from browser/device.
- OSRM road route rendering between rider and customer.
- Restaurant dashboard to move orders and assign online riders.
- Delivery dashboard to go online and start GPS sharing.

INSTALL once in the React project root:
    npm install socket.io-client@4.8.3

Required existing package:
    leaflet@1.9.4

Start backend in terminal 1:
    cd D:\Syed-Food-Center-main\Najaf-delivery-site-main\server
    npm start

Start frontend in terminal 2:
    cd D:\Syed-Food-Center-main\Najaf-delivery-site-main
    npm start

Test customer flow:
1. Open http://localhost:3000/login
2. Register as customer.
3. Open http://localhost:3000/location and choose Use my current location.
4. Add food to cart.
5. Checkout.
6. Place the real order.
7. Open Track my order.

Test restaurant/delivery flow locally:
1. Create another account through the login page only for development, then adjust the role in MongoDB Atlas to restaurant or delivery.
2. Open /restaurant for restaurant control.
3. Open /delivery from the delivery account.
4. Put the delivery account online and start live GPS after an assignment.

IMPORTANT PRODUCTION NOTES:
- Browser GPS is real, but a browser cannot magically provide a rider's position unless the rider device grants location permission and keeps the delivery dashboard open.
- The public Nominatim service has strict usage limits and is not suitable as a high-volume production geocoder. Swap it for a provider or self-hosted geocoder before commercial scale.
- OpenStreetMap's standard tiles are best-effort and have usage requirements. Use a suitable hosted/self-hosted tile provider for production scale.
- OSRM route geometry is real road routing. For production scale, run your own OSRM instance or use a managed routing provider.
- Online payments are NOT implemented by this pack. The current live payment method remains Cash on Delivery.
