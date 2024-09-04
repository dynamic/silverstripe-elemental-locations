<?php

namespace Dynamic\Elements\Locations\Test;

use SilverStripe\Forms\FieldList;
use SilverStripe\Dev\SapphireTest;
use Dynamic\Elements\Locations\Model\Location;

class LocationTest extends SapphireTest
{
    protected static $fixture_file = 'location.yml';

    public function testGetCMSFields()
    {
        $object = $this->objFromFixture(Location::class, 'one');
        $fields = $object->getCMSFields();
        $this->assertInstanceOf(FieldList::class, $fields);
    }
}
