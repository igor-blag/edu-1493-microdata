(function (wp) {
    var el = wp.element.createElement;
    var addFilter = wp.hooks.addFilter;
    var Fragment = wp.element.Fragment;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var SelectControl = wp.components.SelectControl; // Новый компонент
    var createHigherOrderComponent = wp.compose.createHigherOrderComponent;

    // Читаем данные из PHP
    var pageSlug = window.eduSettings ? window.eduSettings.slug : '';
    var dictionary = window.eduSettings ? window.eduSettings.dictionary : {};
    var isEduPage = window.eduSettings ? window.eduSettings.isEduPage : false;

    var allowedBlocks = ['core/group', 'core/paragraph', 'core/columns', 'core/column', 'core/table', 'core/list', 'core/list-item', 'core/heading', 'core/image'];

    addFilter(
        'blocks.registerBlockType',
        'edu-1493/add-itemprop-attribute',
        function (settings, name) {
            if (allowedBlocks.indexOf(name) !== -1) {
                settings.attributes = Object.assign({}, settings.attributes, {
                    itemPropValue: { type: 'string', default: '' },
                });
            }
            return settings;
        }
    );

    var withInspectorControls = createHigherOrderComponent(function (BlockEdit) {
        return function (props) {
            if (allowedBlocks.indexOf(props.name) === -1) {
                return el(BlockEdit, props);
            }

            // Логика выбора контрола
            var inputControl;

            if (isEduPage) {
                // Если мы на спец. странице — показываем выпадающий список
                inputControl = el(SelectControl, {
                    label: 'Тег для раздела "' + pageSlug + '"',
                    value: props.attributes.itemPropValue,
                    options: dictionary[pageSlug],
                    onChange: function (value) {
                        props.setAttributes({ itemPropValue: value });
                    },
                });
            } else {
                // Если это обычная страница — текстовое поле (для ручного ввода)
                // Или можно вернуть null, чтобы скрыть поле совсем
                inputControl = el(TextControl, {
                    label: 'itemprop (ручной ввод)',
                    value: props.attributes.itemPropValue,
                    onChange: function (value) {
                        props.setAttributes({ itemPropValue: value });
                    },
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
                        el('p', { style: { fontSize: '11px', color: '#757575' } }, 
                           isEduPage ? 'Выбраны теги, разрешенные для этой страницы.' : 'Страница не опознана как спец. раздел.')
                    )
                )
            );
        };
    }, 'withInspectorControls');

    addFilter('editor.BlockEdit', 'edu-1493/with-inspector-controls', withInspectorControls);
})(window.wp);