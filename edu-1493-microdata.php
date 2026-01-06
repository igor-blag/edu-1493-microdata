<?php
/**
 * Plugin Name: Edu 1493 Microdata
 * Description: Добавляет поле itemprop к стандартным блокам Gutenberg (Группа, Абзац, Столбцы и др.)
 * Version: 1.0.0
 * Author: Игорь Благовещенский
 * Plugin URI: https://no-it.ru/wordpress-plugins/edu-1493-microdata/
 * Author URI: https://no-it.ru 
 * Requires at least: 6.4
 * Requires PHP: 8.2 
 * License: GPL v3 or later
 * License URI: www.gnu.org
 * Text Domain: edu-1493-microdata
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// 1. Регистрация JS-скрипта для редактора
add_action( 'enqueue_block_editor_assets', function() {
    wp_enqueue_script(
        'edu-microdata-js',
        plugins_url( 'editor.js', __FILE__ ),
        // Добавьте wp-block-editor и wp-components сюда:
        array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-compose', 'wp-hooks', 'wp-block-editor', 'wp-components' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'editor.js' )
    );
});

add_action( 'enqueue_block_editor_assets', function() {
    $screen = get_current_screen();
    
    // Работаем только со страницами (page)
    $current_slug = '';
    if ( $screen->post_type === 'page' ) {
        $post = get_post();
        $current_slug = $post->post_name;
    }

    // Словарь согласно приказу 1493
    $edu_dictionary = [
        'common' => [ // Основные сведения
            ['label' => '-- Выберите тег --', 'value' => ''],
            ['label' => 'Полное наименование (fullName)', 'value' => 'fullName'],
            ['label' => 'Сокращенное наим. (shortName)', 'value' => 'shortName'],
            ['label' => 'Дата создания (regDate)', 'value' => 'regDate'],
            ['label' => 'Адрес (address)', 'value' => 'address'],
            ['label' => 'Режим/график (workTime)', 'value' => 'workTime'],
            ['label' => 'Телефон (telephone)', 'value' => 'telephone'],
            ['label' => 'E-mail (email)', 'value' => 'email'],
            ['label' => 'Ссылка на лицензию (licenseDocLink)', 'value' => 'licenseDocLink'],
        ],
        'document' => [ // Документы
            ['label' => '-- Выберите тег --', 'value' => ''],
            ['label' => 'Устав (ustavDocLink)', 'value' => 'ustavDocLink'],
            ['label' => 'Лок. акт: Обучающиеся (localActStud)', 'value' => 'localActStud'],
            ['label' => 'Лок. акт: Труд. распорядок (localActOrder)', 'value' => 'localActOrder'],
            ['label' => 'Отчет самообслед. (reportEduDocLink)', 'value' => 'reportEduDocLink'],
        ],
        'employees' => [ // Пед. состав
            ['label' => '-- Выберите тег --', 'value' => ''],
            ['label' => 'Контейнер сотрудника (teachingStaff)', 'value' => 'teachingStaff'],
            ['label' => 'ФИО (fio)', 'value' => 'fio'],
            ['label' => 'Должность (post)', 'value' => 'post'],
            ['label' => 'Уровень образования (teachingLevel)', 'value' => 'teachingLevel'],
            ['label' => 'Ученая степень (degree)', 'value' => 'degree'],
        ],
        'managers' => [ // Руководство
            ['label' => '-- Выберите тег --', 'value' => ''],
            ['label' => 'Контейнер руководства (rucovodstvo)', 'value' => 'rucovodstvo'],
            ['label' => 'ФИО (fio)', 'value' => 'fio'],
            ['label' => 'Должность (post)', 'value' => 'post'],
        ],
        // Можно добавить остальные: struct, education, objects и т.д.
    ];

    wp_localize_script( 'edu-microdata-js', 'eduSettings', [
        'slug'       => $current_slug,
        'dictionary' => $edu_dictionary,
        'isEduPage'  => isset($edu_dictionary[$current_slug])
    ]);
});

// 2. Рендеринг атрибута на фронтенде
add_filter( 'render_block', function( $block_content, $block ) {
    // Проверяем, есть ли у блока наш атрибут
    if ( isset( $block['attrs']['itemPropValue'] ) && ! empty( $block['attrs']['itemPropValue'] ) ) {
        $itemprop = esc_attr( $block['attrs']['itemPropValue'] );
        
        // Используем WP_HTML_Tag_Processor (доступен с WP 6.2) для безопасной вставки
        $tags = new WP_HTML_Tag_Processor( $block_content );
        if ( $tags->next_tag() ) {
            $tags->set_attribute( 'itemprop', $itemprop );
            $block_content = $tags->get_updated_html();
        }
    }
    return $block_content;
}, 10, 2 );