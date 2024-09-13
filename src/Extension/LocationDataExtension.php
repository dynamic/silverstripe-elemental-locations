<?php

namespace Dynamic\Elements\Locations\Extension;

use SilverStripe\ORM\DataExtension;
use SilverStripe\Forms\FieldList;

/**
 * Class \Dynamic\Elements\Locations\Extension\LocationDataExtension
 *
 * @property Location|LocationDataExtension $owner
 * @property string $Hours
 */
class LocationDataExtension extends DataExtension
{
    /**
     * @var array
     * @config
     */
    private static array $db = [
        'Hours' => 'Text',
    ];

    /**
     * @param FieldList $fields
     */
    public function updateCMSFields(FieldList $fields): void
    {
        $fields->insertAfter(
            'Links',
            $fields->dataFieldByName('Hours')
        );
    }
}
