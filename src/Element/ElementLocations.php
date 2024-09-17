<?php

namespace Dynamic\Elements\Locations\Elements;

use SilverStripe\ORM\ArrayList;
use SilverStripe\Forms\FieldList;
use SilverStripe\TagField\TagField;
use SilverStripe\Control\Controller;
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
 * @property string $Content
 * @property string $MeasurementUnit
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
        'Content' => 'HTMLText',
        'MeasurementUnit' => 'Enum("IMPERIAL, METRIC", "IMPERIAL")',
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
                ),
                'MeasurementUnit'
            );
        });

        return parent::getCMSFields();
    }

    /**
     * @return string
     */
    public function getKey()
    {
        return Config::inst()->get(GoogleGeocoder::class, 'map_api_key');
    }

    /**
     * @return string
     */
    public function getJSONLink()
    {
        $controller = Controller::curr();
        $segment = Controller::join_links('element', $this->ID, 'json');

        return $controller->Link($segment);
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
     * create a list of assigned categories
     */
    public function getCategoryList()
    {
        if ($this->Categories()->count()) {
            return implode(', ', $this->Categories()->column('Title'));
        }

        return '';
    }

    /**
     * @return string
     */
    public function getSummary(): string
    {
        $categories = $this->getCategoryList();
        $count = $this->Categories()->count();
        if ($count > 0) {
            $label = _t(
                ElementLocations::class . '.CategoriesLabel',
                $categories
            );
        } else {
            $label = _t(
                ElementLocations::class . '.AllLocationsLabel',
                'Showing all locations'
            );
        }
        //Debug::dump($label);
        return DBField::create_field('HTMLText', $label)->Summary(30);
    }

    /**
     * @return string
     */
    public function getType(): string
    {
        return _t(__CLASS__ . '.BlockType', 'Locations');
    }
}
