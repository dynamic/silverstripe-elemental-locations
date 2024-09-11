<?php

namespace Dynamic\Elements\Locations\Test\Elements;

use SilverStripe\Forms\FieldList;
use SilverStripe\Dev\SapphireTest;
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
}
