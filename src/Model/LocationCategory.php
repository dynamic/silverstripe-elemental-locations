<?php

namespace Dynamic\Elements\Locations\Model;

use SilverStripe\ORM\DataObject;

/**
 * Class \Dynamic\Elements\Locations\Model\LocationCategory
 *
 * @property string $Title
 * @method ManyManyList|Location[] Locations()
 */
class LocationCategory extends DataObject
{
    /**
     * @var string
     */
    private static $table_name = 'LocationCategory';

    /**
     * @var string
     * @config
     */
    private static string $singular_name = 'Category';

    /**
     * @var string
     * @config
     */
    private static string $plural_name = 'Categories';

    /**
     * @var string
     * @config
     */
    private static string $description = 'A category to use with Location records';

    private static $db = [
        'Title' => 'Varchar(255)',
    ];

    /**
     * @var array
     */
    private static $belongs_many_many = [
        'Locations' => Location::class,
    ];
}
