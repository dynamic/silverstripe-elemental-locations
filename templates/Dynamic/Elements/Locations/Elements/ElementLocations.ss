<% if $Title && $ShowTitle %><h2 class="element__title">$Title</h2><% end_if %>
<% if $Content %><div class="element__content">$Content</div><% end_if %>

<% require css('dynamic/silverstripe-elemental-locations: dist/css/map.css') %>

  <div class="row g-0">
      <div class="location-col col-md-2 bg-light">
          <div class="locations-panel-text col-md-12 bg-light p-3">
              <h3>Our Locations</h3>
          </div>
          <div id="panel-{$ID}" class="locations-panel col-md-12 bg-light p-3">
              <!-- Panel content here -->
          </div>
          
      </div>
      <div class="col-md-10">
          <!-- Map (full width) -->
      <div id="map-{$ID}" class="locations-map col-12" data-key="$Key" data-link="$JSONLink" data-format="$MeasurementUnit" data-panel="panel-{$ID}"></div>
  </div>  
</div>
    
