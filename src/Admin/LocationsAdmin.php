<?php

namespace Dynamic\Elements\Locations\Admin;

use SilverStripe\Admin\ModelAdmin;
use Dynamic\Elements\Locations\Model\Location;
use Dynamic\Elements\Locations\Model\LocationCategory;

/**
 * Class \Dynamic\Elements\Locations\Admin\LocationsAdmin
 *
 */
class LocationsAdmin extends ModelAdmin
{
    /**
     * @var array
     */
    private static $managed_models = [
        Location::class,
        LocationCategory::class,
    ];

    /**
     * @var string
     */
    private static $menu_title = 'Locations';

    /**
     * @var string
     */
    private static $url_segment = 'locations';
}
