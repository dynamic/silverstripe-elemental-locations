<?php

namespace Dynamic\Elements\Locations\Test;

use SilverStripe\Forms\FieldList;
use SilverStripe\Dev\SapphireTest;
use Dynamic\Elements\Locations\Model\LocationCategory;

class LocationCategoryTest extends SapphireTest
{
    protected static $fixture_file = 'location-category.yml';

    public function testGetCMSFields()
    {
        $object = $this->objFromFixture(LocationCategory::class, 'one');
        $fields = $object->getCMSFields();
        $this->assertInstanceOf(FieldList::class, $fields);
    }
}
