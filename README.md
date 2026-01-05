# edu-1493-microdata
=== Edu 1493 Microdata Extender ===
Contributors: your-username
Tags: education, microdata, rosobrnadzor, 1493, gutenberg, schema
Requires at least: 6.2
Tested up to: 6.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Легкий инструмент для добавления микроразметки Рособрнадзора (Приказ №1493) в блоки Gutenberg.

== Description ==

Плагин разработан для образовательных организаций РФ. Он позволяет добавлять специфические атрибуты `itemprop` к стандартным блокам WordPress (Group, Paragraph, Columns и др.) непосредственно в редакторе Gutenberg.

**Основные функции:**
* Добавление поля "itemprop" в панель настроек блоков.
* Контекстные подсказки тегов в зависимости от алиаса (slug) текущей страницы (например, для /common, /managers, /employees).
* Динамическая вставка атрибутов через WP_HTML_Tag_Processor, что гарантирует валидность HTML-кода.

== Installation ==

1. Загрузите папку плагина в каталог `/wp-content/plugins/`.
2. Активируйте плагин через меню 'Плагины' в WordPress.
3. Откройте любую страницу раздела "Сведения об ОО" и выберите блок для настройки микроразметки.

== Screenshots ==
1. Поле выбора тега itemprop в боковой панели настроек блока.
2. Список подсказок тегов, отфильтрованный по разделу страницы.

== Changelog ==
= 1.0.0 =
* Initial release.
