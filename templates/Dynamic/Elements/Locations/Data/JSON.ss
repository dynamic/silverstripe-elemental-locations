{
    "type": "FeatureCollection",
    "features": [
        <% loop $Locations %>
        {
            "geometry": {
                "type": "Point",
                "coordinates": [
                    $Lng,
                    $Lat
                ]
            },
            "type": "Feature",
            "properties": {
                <% if $Categories %>"category": "$Categories.First.Title.XML",<% end_if %>
                <% if $Hours %>"hours": "10am - 6pm",<% end_if %>
                <% if $Content %>"description": "$Content.XML",<% end_if %>
                <% if $Title %>"name": "$Title.XML",<% end_if %>
                <% if $PhoneNumbers %>"phone": "$Phonenumbers.First.Phone.XML",<% end_if %>
                <% if $EmailAddresses %>"email": "$EmailAddresses.First.Email.XML",<% end_if %>
                <% if $WebsiteLinks %>"website": "$WebsiteLinks.First.URL.XML",<% end_if %>
                "storeid": "$ID.XML"
            }
        }<% if not $IsLast %>,<% end_if %>
        <% end_loop %>
    ]
}