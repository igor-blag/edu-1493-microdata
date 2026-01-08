(function (wp) {
    const { createElement: el, Fragment } = wp.element;
    const { addFilter } = wp.hooks;
    const { InspectorControls } = wp.blockEditor;
    const { PanelBody, SelectControl, TextControl } = wp.components;
    const { createHigherOrderComponent } = wp.compose;
    const { useSelect } = wp.data;

    const settings = window.eduSettings || {};
    const { slug: pageSlug, dictionary, isEduPage } = settings;

    // Blocks that can have itemprop
    const allowedBlocks = ['core/group', 'core/paragraph', 'core/columns', 'core/column', 'core/table', 'core/list', 'core/list-item', 'core/heading', 'core/image'];
    // Blocks treated as "containers" for parent-level tags
    const containerBlocks = ['core/group', 'core/columns', 'core/column'];

    // Register attribute
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

    const withInspectorControls = createHigherOrderComponent((BlockEdit) => {
        return (props) => {
            if (!allowedBlocks.includes(props.name)) {
                return el(BlockEdit, props);
            }

            // Detect parent's itemprop attribute
            const parentItemProp = useSelect((select) => {
                const { getBlockParents, getBlockAttributes } = select('core/block-editor');
                const parents = getBlockParents(props.clientId);
                if (parents.length > 0) {
                    const lastParentId = parents[parents.length - 1];
                    const attrs = getBlockAttributes(lastParentId);
                    return attrs ? attrs.itemPropValue : null;
                }
                return null;
            }, [props.clientId]);

            let inputControl;

            if (isEduPage) {
                const pageTags = dictionary[pageSlug] || [];
                const isCurrentContainer = containerBlocks.includes(props.name);

                // Filter options based on logic:
                // 1. If parent has an itemprop, show tags that belong to that parent.
                // 2. If no parent itemprop, show top-level tags or container tags.
                const filteredOptions = pageTags.filter(tag => {
                    if (parentItemProp) {
                        return tag.parent === parentItemProp;
                    } else {
                        // If current block is container, show tags marked as containers
                        // If it's a regular block, show tags that have no parent requirement
                        return tag.isContainer ? isCurrentContainer : !tag.parent;
                    }
                });

                const options = [
                    { label: '-- Select Tag --', value: '' },
                    ...filteredOptions.map(t => ({ label: t.label, value: t.value }))
                ];

                inputControl = el(SelectControl, {
                    label: parentItemProp ? `Child of ${parentItemProp}` : 'Itemprop Tag',
                    value: props.attributes.itemPropValue,
                    options: options,
                    onChange: (value) => props.setAttributes({ itemPropValue: value }),
                });
            } else {
                inputControl = el(TextControl, {
                    label: 'itemprop (manual)',
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
                        { title: 'Edu 1493 Microdata', initialOpen: true },
                        inputControl,
                        el('p', { style: { fontSize: '11px', color: '#757575' } }, 
                           isEduPage ? 'Tags are filtered by page section and hierarchy.' : 'Manual entry mode (Not an Edu section).')
                    )
                )
            );
        };
    }, 'withInspectorControls');

    addFilter('editor.BlockEdit', 'edu-1493/with-inspector-controls', withInspectorControls);
})(window.wp);