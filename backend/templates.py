def foodTemplate(address, restaurantName, item):

     task=f'''
        1. Go to Wolt.com
        2. Click the location blip icon
        3. Click Add new address
        4. In the Street name and number input enter {address} and then click Enter
        5. Click Continue
        6. On the location selection click on the Chose button for Other the fourth option
        7. In the Address details box enter {address} and then press enter
        8. Click on the Search in Wolt... search bar
        9. Enter {restaurantName} and then search (press enter)
        10. DO NOT SCROLL YET, from the available options, identify the option in the list that has the text {restaurantName} then click it
        11. Scroll through this page until you find the {item} and then click on it
        12. Click Add to order
        13. Click View Order
        14. Click Go to checkout
        15. Now find and click the Click to order button
        16. Click Share tracking
        17. Save the entire track.wolt.com url visible on screen and then navigate to it
        '''
     
     return task

def flightTemplate(toCity, fromCity, date, firstName, lastName, dateOfBirth, email, phoneNumber):

     task=f'''
        1. Go to www.lufthansa.com/cz/en/homepage
        2. On the "Round trip" drop down click it and select "One-way" instead
        3. Click the text input below "From" if it is filled with Prague press the delete x button once the input is cleared enter {fromCity} and press enter
        4. Click the To text input and type {toCity} then press enter
        5. Click on the "Departure" button
        6. Click on the date {date} then scroll down and then click on the "Continue" button
        8. Click on the "Search Flights" button
        9. Scroll down and select the first available flight and click its "Economy" option button
        10. Click on the "Select" button of Economy Light you may need to scroll down
        11. Click on the "Enter Passanger Details Button"
        12. Click on the "Countinue" button or the passangers page
        13. Click on the "Economy" select button
        14. Scroll down and then click on the Economy Zero orange arrow button
        15. Click on the "Countinue with selected flights" button
        16. Click on the "Mr." option in the "Title" dropdown
        17. Enter in the "First name" text input the name {firstName}
        18. Enter in the "Last name" text input the name {lastName}
        19. Enter in the "Date of Birth" text input this exactly {dateOfBirth}
        20. Click on the "Male" gender button
        21. Enter in the "Email" text input {email} you may need to scroll down
        22. In the "Country calling code" dropdown search for Canada and select it
        23. Enter in the "Phone" text input {phoneNumber}
        24. Click on the "Confim" button
        24. Scroll down until the "Continue to payment" button and click it
        '''
     
     return task