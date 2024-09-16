<?php

namespace Dynamic\Elements\Locations\Control;

use SilverStripe\ORM\DataList;
use SilverStripe\ORM\ArrayList;
use SilverStripe\ORM\FieldType\DBHTMLText;
use SilverStripe\View\ArrayData;
use SilverStripe\Control\Director;
use SilverStripe\View\Requirements;
use SilverStripe\Control\Controller;
use SilverStripe\Core\Config\Config;
use SilverStripe\Control\HTTPRequest;
use Dynamic\SilverStripeGeocoder\GoogleGeocoder;
use DNADesign\Elemental\Controllers\ElementController;

/**
 * Class \Dynamic\Elements\Locations\Control\ElementLocationsController
 *
 */
class ElementLocationsController extends ElementController
{
    /**
     * @var DataList|ArrayList
     */
    protected $locations;

    /**
     * @var array
     * @config
     */
    private static array $allowed_actions = [
        'json',
        'Key',
        'JSONLink',
    ];

    /**
     * @return DBHTMLText
     */
    public function json(): DBHTMLText
    {
        $this->getResponse()->addHeader("Content-Type", "application/json");
        $data = new ArrayData([
            "Locations" => $this->getLocations(),
        ]);

        return $data->renderWith('Dynamic/Elements/Locations/Data/JSON');
    }

    /**
     * @return string
     */
    public function getMapsJSString(): string
    {
        return '//maps.googleapis.com/maps/api/js?key=' . $this->getKey() . '&libraries=places&callback=initMap&solution_channel=GMP_codelabs_simplestorelocator_v1_a';
    }

    /**
     * @return string
     */
    public function Key(): string
    {
        return Config::inst()->get(GoogleGeocoder::class, 'map_api_key');
    }

    /**
     * @return ArrayList|DataList
     */
    public function getLocations()
    {
        if (!$this->locations) {
            $this->setLocations();
        }

        return $this->locations;
    }

    /**
     * @return $this
     */
    public function setLocations(): self
    {
        $locations = $this->data()->getLocationsList();

        //allow for adjusting list post possible distance calculation
        $this->extend('updateLocationList', $locations);

        if ($locations->canSortBy('Distance')) {
            $locations = $locations->sort('Distance');
        }

        $this->locations = $locations;

        return $this;
    }

    /**
     * @return string
     */
    public function JSONLink()
    {
        return $this->Link('json');
    }

    /**
     * @param string $action
     *
     * @return string
     */
    public function Link($action = null): string
    {
        $id = $this->element->ID;
        $segment = Controller::join_links('element', $id, $action);
        $page = Director::get_current_page();

        if($page->URLSegment == 'home') {
            return Controller::join_links('home', $segment);
        }

        if ($page && !($page instanceof ElementController)) {
            return $page->Link($segment);
        }

        if ($controller = $this->getParentController()) {
            return $controller->Link($segment);
        }

        return $segment;
    }
}
