def foodTemplate(address, restaurantName, item):
    task = f"""
    1. Navigate to https://wolt.com
    2. Click the location pin icon.
    3. Click "Add new address".
    4. Enter "{address}" into the "Street name and number" input field and press Enter.
    5. Click the "Continue" button.
    6. In the location selection, click the "Choose" button for the "Other" (fourth) option.
    7. In the "Address details" box, enter "{address}" and press Enter.
    8. Click the "Search in Wolt..." search bar.
    9. Enter "{restaurantName}" and press Enter.
    10. From the search results, find and click the result that exactly matches "{restaurantName}".
    11. On the restaurant page, click the search bar and enter "{item}", then press Enter.
    12. Scroll and click the menu item that matches "{item}".
    13. Click the "Add to order" button.
    14. Click "View Order" in the top-right corner.
    15. Click "Go to checkout".
    16. Click the "Click to order" button.
    17. Click "Share tracking".
    18. Copy the visible tracking URL (starting with https://track.wolt.com).
    19. Navigate to the copied tracking URL.
    """
    return task


def flightTemplate(toCity, fromCity, date, firstName, lastName, dateOfBirth, email, phoneNumber):
    task = f"""
    1. Navigate to https://www.lufthansa.com/cz/en/homepage
    2. Click the "Round trip" dropdown and select "One-way".
    3. Click the "From" input. If "Frankfurt" is present, click the "X" to clear it.
    4. Enter "{fromCity}" into the "From" input and press Enter.
    5. Enter "{toCity}" into the "To" input and press Enter.
    6. Click the "Departure" date selector.
    7. Select the date "{date}".
    8. Click the "Continue" button.
    9. Click the "Search Flights" button.
    10. Scroll to the results and click the "Economy" button on the first available flight.
    11. Click the "Select" button for "Economy Light".
    12. Click the "Enter Passenger Details" button.
    13. Click the "Continue" button on the passenger page.
    14. Click the "Economy" option again.
    15. Scroll and click the orange arrow button for "Economy Zero".
    16. Click the "Continue with selected flights" button.
    17. In the "Title" dropdown, select "Mr.".
    18. Enter "{firstName}" in the "First name" input.
    19. Enter "{lastName}" in the "Last name" input.
    20. Enter "{dateOfBirth}" in the "Date of Birth" input.
    21. Select "Male" as the gender.
    22. Enter "{email}" in the "Email" input.
    23. In the "Country calling code" dropdown, search for and select "Canada".
    24. Enter "{phoneNumber}" in the "Phone" input.
    25. Click the "Confirm" button.
    26. Scroll down and click the "Continue to payment" button.
    """
    return task
