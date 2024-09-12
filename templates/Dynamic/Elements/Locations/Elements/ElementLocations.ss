<% if $Title && $ShowTitle %><h2 class="element__title">$Title</h2><% end_if %>
<% if $Content %><div class="element__content">$Content</div><% end_if %>

<% require css('dynamic/silverstripe-elemental-locations: dist/css/map.css') %>

<!-- The div to hold the map -->
<div class="row">
    <div class="col-md-3">
        <div id="panel" class="element__panel"></div>
    </div>
    <div class="col-md-9">
        <div id="map" class="element__map"></div>
    </div>
</div>
