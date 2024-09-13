<?php

namespace Dynamic\Elements\Locations\Control;

use SilverStripe\ORM\DataList;
use SilverStripe\ORM\ArrayList;
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
    ];

    /**
     * @config
     */
    protected function init()
    {
        parent::init();

        $key = $this->getKey();
        $link = $this->Link('json');

        Requirements::javascriptTemplate(
            'dynamic/silverstripe-elemental-locations: dist/js/map.js',
            [
                'key' => $key,
                'link' => $link,
            ]
        );

        Requirements::javascript(
            '//maps.googleapis.com/maps/api/js?key=' . $key . '&libraries=places&callback=initMap&solution_channel=GMP_codelabs_simplestorelocator_v1_a',
            [
                'async' => true,
                'defer' => true,
            ]
        );
    }

    public function json()
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
    public function getKey()
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
    public function setLocations()
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
     * @param string $action
     *
     * @return string
     */
    public function Link($action = null): string
    {
        $id = $this->element->ID;
        $segment = Controller::join_links('element', $id, $action);
        $page = Director::get_current_page();

        if ($page && !($page instanceof ElementController)) {
            return $page->Link($segment);
        }

        if ($controller = $this->getParentController()) {
            return $controller->Link($segment);
        }

        return $segment;
    }

}
