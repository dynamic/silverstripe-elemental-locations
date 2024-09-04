<?php

namespace Dynamic\Elements\Locations\Model;

use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\FieldList;
use SilverStripe\LinkField\Models\Link;
use SilverStripe\LinkField\Form\MultiLinkField;

/**
 * Class \Dynamic\Elements\Locations\Model\Location
 *
 * @property string $Title
 * @property string $Phone
 * @property string $Email
 * @property string $Fax
 * @method DataList|Link[] Links()
 * @method ManyManyList|LocationCategory[] Categories()
 */
class Location extends DataObject
{
    /**
     * @var string
     */
    private static $table_name = 'Location';

    /**
     * @var string
     * @config
     */
    private static string $singular_name = 'Location';

    /**
     * @var string
     * @config
     */
    private static string $plural_name = 'Locations';

    /**
     * @var string
     * @config
     */
    private static string $description = 'A Location for use with the Locations Element';

    /**
     * @var array
     */
    private static $db = [
        'Title' => 'Varchar(255)',
        'Phone' => 'Varchar(40)',
        'Email' => 'Varchar(255)',
        'Fax' => 'Varchar(45)',
    ];

    /**
     * @var array
     */
    private static $has_many = [
        'Links' => Link::class . '.Owner',
    ];

    /**
     * @var array
     */
    private static $many_many = [
        'Categories' => LocationCategory::class,
    ];

    /**
     * @var array
     */
    private static $owns = [
        'Links',
    ];

    /**
     * @var array
     */
    public function getCMSFields()
    {
        $this->beforeUpdateCMSFields(function (FieldList $fields) {
            $fields->removeByName(['Links']);

            $fields->addFieldsToTab(
                'Root.Main',
                [
                    MultiLinkField::create('Links'),
                ]
            );
        });

        return parent::getCMSFields();
    }
}
