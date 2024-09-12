<?php

namespace Dynamic\Elements\Locaitons\Extension;

use Dynamic\Elements\Locations\Elements\ElementLocations;
use SilverStripe\ORM\DataExtension;

/**
 * Class \Dynamic\Elements\Locaitons\Extension\LocationCategoryDataExtension
 *
 * @property LocationCategory|LocationCategoryDataExtension $owner
 * @method ManyManyList|ElementLocations[] ElementLocations()
 */
class LocationCategoryDataExtension extends DataExtension
{
    /**
     * @var array
     * @config
     */
    private static array $belongs_many_many = [
        'ElementLocations' => ElementLocations::class,
    ];
}
