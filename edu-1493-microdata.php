<?php
/**
 * Plugin Name: Edu 1493 Microdata
 * Description: Adds itemprop attributes to standard Gutenberg blocks (Group, Paragraph, etc.) according to Rosobrnadzor requirements.
 * Version: 1.1.0
 * Author: Igor Blagoveshchensky
 * Plugin URI: https://no-it.ru/wordpress-plugins/edu-1493-microdata/
 * Author URI: https://no-it.ru 
 * Requires at least: 6.4
 * Requires PHP: 7.4 
 * License: GPL v3 or later
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Register assets and pass data to the editor.
 */
add_action( 'enqueue_block_editor_assets', function() {
    $plugin_dir = plugin_dir_path( __FILE__ );
    $json_path = $plugin_dir . 'tags.json';
    
    // Load and decode the JSON dictionary
    $edu_dictionary = [];
    if ( file_exists( $json_path ) ) {
        $json_content = file_get_contents( $json_path );
        $edu_dictionary = json_decode( $json_content, true );
    }

    // Register the main JS file
    wp_enqueue_script(
        'edu-microdata-js',
        plugins_url( 'editor.js', __FILE__ ),
        [ 'wp-blocks', 'wp-element', 'wp-editor', 'wp-compose', 'wp-hooks', 'wp-block-editor', 'wp-components', 'wp-data' ],
        filemtime( $plugin_dir . 'editor.js' )
    );

    // Get current page context
    $screen = get_current_screen();
    $current_slug = '';
    if ( $screen && $screen->post_type === 'page' ) {
        $post = get_post();
        $current_slug = $post->post_name;
    }

    // Pass settings to JS
    wp_localize_script( 'edu-microdata-js', 'eduSettings', [
        'slug'       => $current_slug,
        'dictionary' => $edu_dictionary,
        'isEduPage'  => isset( $edu_dictionary[ $current_slug ] )
    ]);
});

/**
 * Render the itemprop attribute on the frontend using WP_HTML_Tag_Processor.
 */
add_filter( 'render_block', function( $block_content, $block ) {
    if ( isset( $block['attrs']['itemPropValue'] ) && ! empty( $block['attrs']['itemPropValue'] ) ) {
        $itemprop = esc_attr( $block['attrs']['itemPropValue'] );
        
        $tags = new WP_HTML_Tag_Processor( $block_content );
        if ( $tags->next_tag() ) {
            $tags->set_attribute( 'itemprop', $itemprop );
            $block_content = $tags->get_updated_html();
        }
    }
    return $block_content;
}, 10, 2 );