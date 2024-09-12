<?php

namespace Dynamic\Elements\Locations\Test\Elements;

use SilverStripe\ORM\DataList;
use SilverStripe\Forms\FieldList;
use SilverStripe\Dev\SapphireTest;
use Dynamic\Locations\Model\Location;
use Dynamic\Elements\Locations\Elements\ElementLocations;

class ElementLocationsTest extends SapphireTest
{
    /**
     * @var string
     */
    protected static $fixture_file = 'ElementLocationsTest.yml';

    /**
     *
     */
    public function testGetCMSFields(): void
    {
        $object = $this->objFromFixture(ElementLocations::class, 'one');
        $fields = $object->getCMSFields();
        $this->assertInstanceOf(FieldList::class, $fields);
    }

    /**
     *
     */
    public function testGetSummary()
    {
        $object = $this->objFromFixture(ElementLocations::class, 'one');
        $count = $object->getLocationsList()->count();
        $this->assertEquals(
            $object->getSummary(),
            _t(
                Location::class . 'PLURALS',
                'A Location|{count} Locations',
                ['count' => $count]
            )
        );
    }

    /**
     *
     */
    public function testGetLocationsList(): void
    {
        $object = $this->objFromFixture(ElementLocations::class, 'one');
        $this->compareList(
            DataList::create(Location::class),
            $object->getLocationsList(),
            'Should return all locations as not being filtered by location category'
        );

        $object = $this->objFromFixture(ElementLocations::class, 'two');
        $this->compareList(
            DataList::create(Location::class)->filter('Categories.ID', $object->Categories()->column()),
            $object->getLocationsList(),
            'Should only return locations assigned to location category'
        );
    }

    /**
     *
     */
    private function compareList(DataList $expected, DataList $actual, $message = ''): void
    {
        $expectedArray = $expected->map('ID', 'ClassName')->toArray();
        $actualArray = $expected->map('ID', 'ClassName')->toArray();
        $this->assertEquals($expectedArray, $actualArray, $message);
    }
}
