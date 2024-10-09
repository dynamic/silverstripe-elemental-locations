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
                <% if $Title %>"store_name": "$Title.XML",<% end_if %>
                <% if $FullAddress %>"full_address": "$FullAddress.XML",<% end_if %>
                <% if $Address %>"address": "$Address.XML",<% end_if %>
                <% if $Address2 %>"address_2": "$Address2.XML",<% end_if %>
                <% if $City %>"city": "$City.XML",<% end_if %>
                <% if $State %>"state": "$State.XML",<% end_if %>
                <% if $PostalCode %>"postal_code": "$PostalCode.XML",<% end_if %>
                <% if $Country %>"country": "$Country.XML",<% end_if %>
                <% if $PhoneNumbers %>"phone": "$Phonenumbers.First.Phone.XML",<% end_if %>
                <% if $EmailAddresses %>"email": "$EmailAddresses.First.Email.XML",<% end_if %>
                <% if $WebsiteLinks %>"website": "$WebsiteLinks.First.URL.XML",<% end_if %>
                <% if $Categories %>"category": "$CategoryList.XML",<% end_if %>
                <% if $Hours %>"hours": "$Hours.JSON",<% end_if %>
                <% if $Content %>"description": "$Content.JSON",<% end_if %>
                "storeid": "$ID.XML"
            }
        }<% if not $IsLast %>,<% end_if %>
        <% end_loop %>
    ]
}