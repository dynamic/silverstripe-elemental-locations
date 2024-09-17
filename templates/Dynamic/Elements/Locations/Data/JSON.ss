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
                <% if $Categories %>"category": "$CategoryList.XML",<% end_if %>
                <% if $Hours %>"hours": "$Hours.XML",<% end_if %>
                <% if $Content %>"description": "$Content.JSON",<% end_if %>
                <% if $Title %>"name": "$Title.XML",<% end_if %>
                <% if $PhoneNumbers %>"phone": "$Phonenumbers.First.Phone.XML",<% end_if %>
                <% if $EmailAddresses %>"email": "$EmailAddresses.First.Email.XML",<% end_if %>
                <% if $WebsiteLinks %>"website": "$WebsiteLinks.First.URL.XML",<% end_if %>
                <% if $FullAddress %>"address": "$FullAddress.XML",<% end_if %>
                "storeid": "$ID.XML"
            }
        }<% if not $IsLast %>,<% end_if %>
        <% end_loop %>
    ]
}