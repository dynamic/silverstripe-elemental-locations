<?php

namespace Dynamic\Elements\Locations\Control;

use SilverStripe\ORM\DataList;
use SilverStripe\ORM\ArrayList;
use SilverStripe\View\ArrayData;
use SilverStripe\Control\Director;
use SilverStripe\View\Requirements;
use SilverStripe\Control\Controller;
use SilverStripe\Core\Config\Config;
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

        Requirements::javascript(
            'dynamic/silverstripe-elemental-locations: dist/js/map.js'
        );

        $key = $this->data()->getKey();

        Requirements::javascript(
            '//maps.googleapis.com/maps/api/js?key=' . $key . '&libraries=places&callback=initMap',
            [
                'async' => true,
                'defer' => true,
            ]
        );
    }

    /**
     * @return string
     */
    public function json()
    {
        $this->getResponse()->addHeader("Content-Type", "application/json");
        $data = new ArrayData([
            "Locations" => $this->getLocations(),
        ]);

        return $data->renderWith('Dynamic/Elements/Locations/Data/JSON');
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
}
