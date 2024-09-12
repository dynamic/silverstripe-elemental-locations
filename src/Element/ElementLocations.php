<?php

namespace Dynamic\Elements\Locations\Elements;

use SilverStripe\ORM\ArrayList;
use SilverStripe\Forms\FieldList;
use SilverStripe\TagField\TagField;
use SilverStripe\View\Requirements;
use SilverStripe\Core\Config\Config;
use Dynamic\Locations\Model\Location;
use SilverStripe\ORM\FieldType\DBField;
use DNADesign\Elemental\Models\BaseElement;
use Dynamic\Locations\Model\LocationCategory;
use Dynamic\SilverStripeGeocoder\GoogleGeocoder;
use Dynamic\Elements\Locations\Control\ElementLocationsController;

/**
 * Class \Dynamic\Elements\Locations\Elements\ElementLocations
 *
 * @method ManyManyList|LocationCategory[] Categories()
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
     * @var string
     * @config
     */
    private static $controller_class = ElementLocationsController::class;

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
    private static array $many_many = [
        'Categories' => LocationCategory::class,
    ];

    /**
     * @return FieldList
     */
    public function getCMSFields(): FieldList
    {
        $this->beforeUpdateCMSFields(function (FieldList $fields) {

            $fields->removeByName('Categories');

            $fields->addFieldToTab(
                'Root.Main',
                TagField::create(
                    'Categories',
                    'Categories',
                    LocationCategory::get(),
                    $this->Categories()
                )
            );
        });

        return parent::getCMSFields();
    }

    /**
     * return ArrayList
     */
    public function getLocationsList()
    {
        $locations = ArrayList::create();

        if ($this->Categories()->count()) {
            $locations = Location::get()->filter('Categories.ID', $this->Categories()->column());
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
