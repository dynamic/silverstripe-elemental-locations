<?php

namespace Dynamic\Elements\Locations\Elements;

use SilverStripe\ORM\FieldType\DBField;
use DNADesign\Elemental\Models\BaseElement;

/**
 * Class \Dynamic\Elements\Locations\Elements\ElementLocations
 *
 */
class ElementLocations extends BaseElement
{
    /**
     * @var string
     * @config
     */
    private static string $table_name = 'ElementLocations';

    /**
     * @var string
     * @config
     */
    private static string $singular_name = 'Locations';

    /**
     * @var string
     * @config
     */
    private static string $plural_name = 'Locations';

    /**
     * @var string
     * @config
     */
    private static string $description = 'A locations element';

    /**
     * @var string
     * @config
     */
    private static string $icon = 'font-icon-globe';

    /**
     * @return string
     */
    public function getSummary(): string
    {
        return DBField::create_field('HTMLText', 'Locations')->Summary(20);
    }

    /**
     * @return string
     */
    public function getType(): string
    {
        return _t(__CLASS__ . '.BlockType', 'Locations');
    }
}
