<% if $Title && $ShowTitle %><h2 class="element__title">$Title</h2><% end_if %>
<% if $Content %><div class="element__content">$Content</div><% end_if %>

<% require css('dynamic/silverstripe-elemental-locations: dist/css/map.css') %>

<!-- The div to hold the map -->
<div class="row">
    <div class="row position-relative">
    <!-- Panel (initially hidden) -->
    <div id="panel-{$ID}" class="locations-panel col-md-4 col-sm-6 position-absolute bg-light h-100" style="left: 0; z-index: 1; display: none;">
      <!-- Panel content here -->
      <h2>Location Search Results</h2>
    </div>
    
    <!-- Map (full width) -->
    <div id="map-{$ID}" class="locations-map col-12 position-relative" data-key="$Key" data-link="$JSONLink" data-format="$MeasurementUnit" data-panel="panel-{$ID}">
      <!-- Map content here -->
      <div style="height: 500px; background-color: lightblue;">Map Area</div>
    </div>
  </div>
</div>
