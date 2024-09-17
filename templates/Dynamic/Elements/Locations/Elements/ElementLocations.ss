<% if $Title && $ShowTitle %><h2 class="element__title">$Title</h2><% end_if %>
<% if $Content %><div class="element__content">$Content</div><% end_if %>

<% require css('dynamic/silverstripe-elemental-locations: dist/css/map.css') %>

<div class="row g-0">
    <div class="col-md-9 order-md-2 order-1">
        <!-- Map (full width) -->
        <div id="map-{$ID}" class="locations-map col-12" data-key="$Key" data-link="$JSONLink" data-format="$MeasurementUnit" data-panel="panel-{$ID}" data-search="search-{$ID}"></div>
    </div>
    <div class="location-col col-md-3 bg-light order-md-1 order-2">
        <div id="search-{$ID}" class="locations-search col-md-12 bg-light p-3">
            <!-- Search form here -->
        </div>
        <div id="panel-{$ID}" class="locations-panel col-md-12 bg-light p-3">
            <!-- Panel content here -->
        </div>      
    </div>
</div>