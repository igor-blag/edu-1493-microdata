=== Edu 1493 Microdata ===
Contributors: Igor-blag
Tags: rosobrnadzor, microdata, gutenberg, schema, russian-education
Requires at least: 6.4
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.1.0
License: GPLv3 or later
License URI: http://www.gnu.org/licenses/gpl-3.0.html

Easily add Rosobrnadzor microdata (Order №1493) to Gutenberg blocks with a context-aware tag selector.

== Description ==

The plugin is designed for Russian educational organizations to comply with Government Order №1493. It allows users to add specific `itemprop` attributes to standard WordPress blocks (Group, Paragraph, Columns, Table, etc.) directly within the Gutenberg editor.

**Key Features:**
*   Adds an "itemprop" selection field to the block settings sidebar.
*   **Context-aware logic:** Suggests tags based on the current page slug (e.g., /common, /employees, /struct).
*   **Hierarchy support:** Filters child tags based on the parent block's `itemprop` (e.g., inside a "teachingStaff" container).
*   **JSON-driven dictionary:** Easy to update and extend microdata tags.
*   Uses `WP_HTML_Tag_Processor` for safe and valid HTML attribute injection.

---

Плагин разработан для образовательных организаций РФ. Он позволяет добавлять специфические атрибуты `itemprop` (Приказ №1493) к стандартным блокам WordPress непосредственно в редакторе Gutenberg.

**Основные функции:**
*   Добавление поля "itemprop" в панель настроек блоков.
*   Контекстные подсказки тегов в зависимости от алиаса страницы (например, /common, /managers, /employees).
*   Учет вложенности: плагин предлагает дочерние теги только внутри соответствующих главных тегов-контейнеров.
*   Динамическая вставка атрибутов через WP_HTML_Tag_Processor, что гарантирует валидность кода.

== Installation ==

1. Upload the plugin folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Open any page within the "Svedenia" section and select a block to configure its microdata.

== Screenshots ==

1. The itemprop selection field in the block settings sidebar.
2. Filtered tag suggestions based on the page section and hierarchy.

== Frequently Asked Questions ==

= How do I add new tags? =
You can extend the `tags.json` file located in the plugin directory to add new sections or attributes.

= Does it work with third-party blocks? =
Currently, it supports core WordPress blocks like Group, Paragraph, Columns, Table, List, and Image.

== Changelog ==

= 1.1.0 =
*   Refactored code: moved tag dictionary to an external JSON file.
*   Added hierarchical tag logic (parent/child relationship).
*   Improved tag filtering based on block types (Container vs. Leaf).
*   Translated code comments and documentation to English for repository standards.

= 1.0.0 =
*   Initial release.