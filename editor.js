(function (wp) {
    const { createElement: el, Fragment } = wp.element;
    const { addFilter } = wp.hooks;
    const { InspectorControls } = wp.blockEditor;
    const { PanelBody, SelectControl, TextControl } = wp.components;
    const { createHigherOrderComponent } = wp.compose;
    const { useSelect } = wp.data;

    // Retrieve settings passed from PHP via wp_localize_script
    const settings = window.eduSettings || {};
    const { slug: pageSlug, dictionary, isEduPage } = settings;


    // Blocks that can have itemprop
    const allowedBlocks = [
        'core/group', 
        'core/paragraph', 
        'core/file', 
        'core/buttons',
        'core/button', 
        'core/media-text', 
        'core/columns', 
        'core/column', 
        'core/table', 
        'core/list', 
        'core/list-item', 
        'core/heading', 
        'core/image'
        ];
    // Blocks treated as "containers" for parent-level tags
    const containerBlocks = [
        'core/group', 
        'core/columns', 
        'core/column', 
        'core/buttons', 
        'core/media-text', 
        'core/list',
        'core/media-text'
        ];

    /**
     * Optimization: Create a Set of all tags marked as "isContainer" for the current page.
     * This allows O(1) constant-time lookups during the parent-search loop.
     */
    const containerTags = new Set(
        (dictionary[pageSlug] || [])
            .filter(tag => tag.isContainer)
            .map(tag => tag.value)
    );

    /**
     * 1. Register the custom attribute 'itemPropValue' for allowed blocks.
     */
    addFilter(
        'blocks.registerBlockType',
        'edu-1493/add-itemprop-attribute',
        (settings, name) => {
            if (allowedBlocks.includes(name)) {
                settings.attributes = Object.assign({}, settings.attributes, {
                    itemPropValue: { type: 'string', default: '' },
                });
            }
            return settings;
        }
    );

    /**
     * 2. Add UI controls to the block sidebar (Inspector Controls).
     */
    const withInspectorControls = createHigherOrderComponent((BlockEdit) => {
        return (props) => {
            // Do nothing if the block type is not in our allowed list
            if (!allowedBlocks.includes(props.name)) {
                return el(BlockEdit, props);
            }

            /**
             * Find the nearest ancestor that has a valid "container" itemprop.
             * This allows the plugin to work even with deep nesting 
             * (e.g., Group -> Columns -> Column -> Paragraph).
             */
            const parentItemProp = useSelect((select) => {
                const { getBlockParents, getBlockAttributes } = select('core/block-editor');
                const parents = getBlockParents(props.clientId);
                
                // Iterate backwards from the closest parent to the root
                for (let i = parents.length - 1; i >= 0; i--) {
                    const attrs = getBlockAttributes(parents[i]);
                    const val = attrs ? attrs.itemPropValue : null;
                    
                    // Check if the parent's tag is defined as a container in our JSON
                    if (val && containerTags.has(val)) {
                        return val;
                    }
                }
                return null;
            }, [props.clientId]);

            let inputControl;

            if (isEduPage) {
                // Logic for pages identified as "Special Edu Sections"
                const pageTags = dictionary[pageSlug] || [];
                const isCurrentContainer = containerBlocks.includes(props.name);

                // Filter tags based on hierarchy:
                const filteredOptions = pageTags.filter(tag => {
                    if (parentItemProp) {
                        // If inside a container, show only tags that belong to it
                        return tag.parent === parentItemProp;
                    } else {
                        // If no parent container found:
                        // - Show container tags for Group/Columns
                        // - Show root-level tags for content blocks
                        return tag.isContainer ? isCurrentContainer : !tag.parent;
                    }
                });

                const options = [
                    { label: '-- Выберите тег --', value: '' },
                    ...filteredOptions.map(t => ({ label: t.label, value: t.value }))
                ];

                inputControl = el(SelectControl, {
                    label: parentItemProp ? `Дочерний тег для "${parentItemProp}"` : 'Тег микроразметки',
                    value: props.attributes.itemPropValue,
                    options: options,
                    onChange: (value) => props.setAttributes({ itemPropValue: value }),
                });
            } else {
                // Manual input mode for regular pages
                inputControl = el(TextControl, {
                    label: 'itemprop (ручной ввод)',
                    value: props.attributes.itemPropValue,
                    onChange: (value) => props.setAttributes({ itemPropValue: value }),
                });
            }

            return el(
                Fragment,
                null,
                el(BlockEdit, props),
                el(
                    InspectorControls,
                    null,
                    el(
                        PanelBody,
                        { title: 'Микроразметка Рособрнадзора', initialOpen: true },
                        inputControl,
                        el('p', { 
                            style: { 
                                fontSize: '11px', 
                                color: '#757575', 
                                marginTop: '10px',
                                lineHeight: '1.4'
                            } 
                        }, 
                        isEduPage 
                            ? (parentItemProp 
                                ? `Блок находится внутри контейнера "${parentItemProp}". Список тегов отфильтрован.` 
                                : 'Список тегов отфильтрован для этого раздела.')
                            : 'Страница не опознана как спец. раздел. Доступен ручной ввод.')
                    )
                )
            );
        };
    }, 'withInspectorControls');

    // Apply the filter to the BlockEdit component
    addFilter('editor.BlockEdit', 'edu-1493/with-inspector-controls', withInspectorControls);

})(window.wp);