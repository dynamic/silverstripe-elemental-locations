<?php

namespace Dynamic\Elements\Locations\Elements;

use SilverStripe\ORM\ArrayList;
use Dynamic\Locations\Model\Location;
use SilverStripe\ORM\FieldType\DBField;
use DNADesign\Elemental\Models\BaseElement;
use Dynamic\Locations\Model\LocationCategory;

/**
 * Class \Dynamic\Elements\Locations\Elements\ElementLocations
 *
 * @property int $CategoryID
 * @method LocationCategory Category()
 */
class ElementLocations extends BaseElement
{
    /**
     * @var string
     * @config
     */
    private static string $table_name = 'ElementLocations';

    /**
     * @var string
     * @config
     */
    private static string $icon = 'font-icon-globe';

    /**
     * @var array
     * @config
     */
    private static array $db = [

    ];

    /**
     * @var array
     * @config
     */
    private static array $has_one = [
        'Category' => LocationCategory::class,
    ];

    /**
     * return ArrayList
     */
    public function getLocationsList()
    {
        $locations = ArrayList::create();

        if ($this->CategoryID && $category = LocationCategory::get()->byID($this->CategoryID)) {
            $locations = Location::get()->filter('Categories.ID', $category->ID);
        } else {
            $locations = Location::get();
        }

        $this->extend('updateGetLocationsList', $locations);

        return $locations;
    }

    /**
     * @return string
     */
    public function getSummary(): string
    {
        $count = $this->getLocationsList()->count();
        $label = _t(
            Location::class . '.PLURALS',
            '1 Location|{count} Locations',
            [ 'count' => $count ]
        );
        return DBField::create_field('HTMLText', $label)->Summary(20);
    }

    /**
     * @return string
     */
    public function getType(): string
    {
        return _t(__CLASS__ . '.BlockType', 'Locations');
    }
}
